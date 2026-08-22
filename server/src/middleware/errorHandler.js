import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';

// Centralized error-handling middleware
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = ApiError.badRequest('Validation failed', messages);
  }

  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = ApiError.conflict(`Duplicate value entered for ${field}`);
  }

  // If not already an ApiError, treat as Internal Server Error
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, null, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(!config.isProduction && { stack: error.stack }),
  };

  return res.status(error.statusCode || 500).json(response);
};
