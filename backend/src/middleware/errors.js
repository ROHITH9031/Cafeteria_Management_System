export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', errors: Object.values(error.errors).map((item) => item.message) });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists' });
  }
  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 600) {
    return res.status(error.status).json({ message: error.message });
  }
  return res.status(500).json({ message: 'Internal server error' });
}
