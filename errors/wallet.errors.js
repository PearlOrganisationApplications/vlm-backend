const AppError = require('./AppError');

class InsufficientBalanceError extends AppError {
  constructor(message = 'Insufficient wallet balance for this transaction') {
    super(message, 400);
    this.name = 'InsufficientBalanceError';
  }
}

class DuplicatePaymentError extends AppError {
  constructor(message = 'This payment has already been processed') {
    super(message, 409);
    this.name = 'DuplicatePaymentError';
  }
}

class WebhookVerificationError extends AppError {
  constructor(message = 'Invalid webhook signature') {
    super(message, 400);
    this.name = 'WebhookVerificationError';
  }
}

module.exports = {
  InsufficientBalanceError,
  DuplicatePaymentError,
  WebhookVerificationError
};
