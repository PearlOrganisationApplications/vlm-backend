const walletService = require('../services/wallet.service');

const createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    const orderData = await walletService.createTopUpOrder(userId, amount);

    res.status(200).json({
      success: true,
      data: orderData
    });
  } catch (error) {
    next(error);
  }
};

const webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody; // ✅ Now this will always have the exact original string

    console.log('rawBody type:', typeof rawBody); // should be 'string'

    await walletService.handleWebhookEvent(req.body, signature, rawBody);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook Controller Error]', error);
    if (error.name === 'WebhookVerificationError') {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    } else {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
};

const getBalance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const balance = await walletService.getBalance(userId);

    res.status(200).json({
      success: true,
      data: { balance }
    });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const data = await walletService.getTransactions(userId, page, limit);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  webhook,
  getBalance,
  getTransactions
};
