const mongoose = require('mongoose');
const crypto = require('crypto');
const razorpay = require('../config/razorpay'); // Reusing existing razorpay config
const Student = require('../models/Student');
const WalletTransaction = require('../models/WalletTransaction');
const { InsufficientBalanceError, WebhookVerificationError } = require('../errors/wallet.errors');
const AppError = require('../errors/AppError');

/**
 * Creates a Razorpay order for wallet top-up.
 * @param {string} userId - ID of the user.
 * @param {number} amount - Amount in rupees.
 */
const createTopUpOrder = async (userId, amount) => {
  const amountInPaise = Math.round(amount * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    notes: {
      userId: userId.toString() // Passed so we can track the user in webhook
    }
  };

  const order = await razorpay.orders.create(options);

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID
  };
};

/**
 * Processes the Razorpay payment.captured webhook event.
 * @param {Object} event - Parsed Razorpay webhook payload.
 * @param {string} signature - X-Razorpay-Signature header.
 * @param {string} rawBody - Raw stringified request body.
 */
const handleWebhookEvent = async (event, signature, rawBody) => {

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!rawBody) {
    console.error('[Webhook] CRITICAL: rawBody is undefined.');
    throw new WebhookVerificationError();
  }

  // Calculate expected signature for debugging
  const expectedSignature = crypto
    .createHmac('sha256', secret || '')
    .update(rawBody)
    .digest('hex');
    
  console.log('--- Webhook Debug ---');
  console.log('Secret used:', secret);
  console.log('Raw Body Length:', rawBody.length);
  console.log('Expected Signature:', expectedSignature);
  console.log('Received Signature:', signature);
  console.log('---------------------');

  if (expectedSignature !== signature) {
    console.error('[Webhook] Signature mismatch!');
    throw new WebhookVerificationError();
  }

  if (event.event !== 'payment.captured') {
    return;
  }

  const paymentEntity = event.payload.payment.entity;
  const paymentId = paymentEntity.id;
  const amountInRupees = paymentEntity.amount / 100;
  const userId = paymentEntity.notes && paymentEntity.notes.userId;

  if (!userId) {
    console.error(`[Webhook] No userId found in payment notes for paymentId: ${paymentId}`);
    return;
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const existingTransaction = await WalletTransaction.findOne({ referenceId: paymentId }).session(session);

    if (existingTransaction) {
      await session.commitTransaction();
      return;
    }

    await WalletTransaction.create([{
      userId,
      type: 'TOP_UP',
      amount: amountInRupees,
      status: 'SUCCESS',
      referenceId: paymentId,
      metadata: paymentEntity
    }], { session });

    // Update Student.wallet.totalBalance
    const updatedStudent = await Student.findOneAndUpdate(
      { userId },
      { $inc: { "wallet.totalBalance": amountInRupees } },
      { new: true, session }
    );

    if (!updatedStudent) {
      console.error(`[Webhook] Student profile not found for user ${userId}. Wallet not credited.`);
      throw new Error("Student profile not found");
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      console.log(`[Webhook] Concurrent processing detected for ${paymentId}. Ignored.`);
    } else {
      throw error;
    }
  } finally {
    session.endSession();
  }
};

/**
 * Deducts balance from the user's wallet.
 */
const deductBalance = async (userId, amount, referenceId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const updatedStudent = await Student.findOneAndUpdate(
      {
        userId: userId,
        "wallet.totalBalance": { $gte: amount }
      },
      {
        $inc: { "wallet.totalBalance": -amount }
      },
      { new: true, session }
    );

    if (!updatedStudent) {
      const student = await Student.findOne({ userId }).session(session);
      if (!student) {
        throw new AppError('Student profile not found', 404);
      }
      if (student.wallet.totalBalance < amount) {
        throw new InsufficientBalanceError();
      }
      throw new AppError('Concurrent modification failed', 500);
    }

    await WalletTransaction.create([{
      userId,
      type: 'DEBIT',
      amount: amount,
      status: 'SUCCESS',
      referenceId: referenceId
    }], { session });

    await session.commitTransaction();
    return updatedStudent.wallet.totalBalance;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Retrieves the current wallet balance.
 */
const getBalance = async (userId) => {
  const student = await Student.findOne({ userId });
  return student && student.wallet ? student.wallet.totalBalance : 0;
};

/**
 * Retrieves paginated transactions.
 */
const getTransactions = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-metadata'),
    WalletTransaction.countDocuments({ userId })
  ]);

  return {
    transactions,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page, 10)
  };
};

module.exports = {
  createTopUpOrder,
  handleWebhookEvent,
  deductBalance,
  getBalance,
  getTransactions
};
