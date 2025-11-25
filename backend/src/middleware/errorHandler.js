// ==========================================
// middleware/errorHandler.js
// Global error handling
// ==========================================

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', err);
  
  // Default error
  let statusCode = 500;
  let message = 'Internal server error';
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  
  // Custom application errors
  if (err.message) {
    message = err.message;
    
    // Set appropriate status codes based on message
    if (message.includes('not found')) statusCode = 404;
    if (message.includes('already')) statusCode = 409;
    if (message.includes('Invalid') || message.includes('required')) statusCode = 400;
    if (message.includes('Unauthorized') || message.includes('token')) statusCode = 401;
    if (message.includes('permission') || message.includes('locked')) statusCode = 403;
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
