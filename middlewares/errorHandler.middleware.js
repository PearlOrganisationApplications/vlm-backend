const AppError = require('../errors/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(`[Error Stack]:`, err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: error.name || 'ServerError',
      message: error.message || 'Internal Server Error'
    }
  });
};

module.exports = errorHandler;
