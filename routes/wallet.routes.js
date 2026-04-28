const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const Joi = require('joi');

const validateSchema = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ValidationError',
          message: error.details.map(i => i.message).join(', ')
        }
      });
    }
    next();
  };
};

const createOrderSchema = Joi.object({
  amount: Joi.number().positive().min(1).required()
});

const getTransactionsSchema = Joi.object({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional()
});

// Webhook
router.post('/webhook', walletController.webhook);

router.use(authMiddleware);

router.post('/create-order', validateSchema(createOrderSchema, 'body'), walletController.createOrder);
router.get('/balance', walletController.getBalance);
router.get('/transactions', validateSchema(getTransactionsSchema, 'query'), walletController.getTransactions);

module.exports = router;
