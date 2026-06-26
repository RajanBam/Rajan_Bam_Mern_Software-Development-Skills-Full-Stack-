// 404 handler for unknown routes.
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler so controllers can just `throw` or call next(err).
function errorHandler(err, req, res, next) {
  // Duplicate key (e.g. email already registered).
  if (err && err.code === 11000) {
    return res.status(409).json({ message: 'That email is already registered' });
  }
  // Mongoose validation errors -> readable list.
  if (err && err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error(err);
  res.status(status).json({ message: err.message || 'Something went wrong' });
}

module.exports = { notFound, errorHandler };
