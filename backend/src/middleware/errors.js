const statusLabels = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  413: 'Payload Too Large',
  415: 'Unsupported Media Type',
  429: 'Too Many Requests',
};

export function sendApiError(res, status, message, error = statusLabels[status] || 'Client Error', details) {
  const payload = { status, error, message };
  if (details?.length) payload.errors = details;
  if (res.locals?.requestId) payload.requestId = res.locals.requestId;
  return res.status(status).json(payload);
}

export function notFound(req, res) {
  return sendApiError(res, 404, `Route not found: ${req.method} ${req.path}`);
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const requestId = res.locals?.requestId || 'unknown';
  const method = req.method || 'UNKNOWN';
  const path = req.path || req.originalUrl || 'unknown';
  console.error(JSON.stringify({
    level: 'error',
    event: 'api_error',
    requestId,
    method,
    path,
    errorName: error.name || 'Error',
    code: typeof error.code === 'string' || typeof error.code === 'number' ? error.code : undefined,
  }));

  // Invalid JSON from express.json().
  if (error instanceof SyntaxError && (error.type === 'entity.parse.failed' || (error.status === 400 && 'body' in error))) {
    return sendApiError(res, 400, 'Malformed JSON payload in request body');
  }

  // Request body parser errors.
  if (error.type === 'entity.too.large') {
    return sendApiError(res, 413, 'Request body exceeds the 100kb limit');
  }
  if (error.type === 'encoding.unsupported' || error.type === 'charset.unsupported') {
    return sendApiError(res, 415, 'Request encoding or charset is not supported');
  }
  if (error.type === 'request.aborted') {
    return sendApiError(res, 400, 'Request was interrupted before it was received');
  }

  // Errors deliberately produced by the CORS allowlist.
  if (error.message === 'Not allowed by CORS') {
    return sendApiError(res, 403, 'This origin is not allowed');
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors || {}).map((item) => item.message).filter(Boolean);
    return sendApiError(res, 400, 'Validation failed', 'Validation Error', messages);
  }

  if (error.name === 'CastError') {
    return sendApiError(res, 400, `Invalid ${error.path || 'value'}: ${error.value}`, 'Invalid Identifier');
  }

  if (error.code === 11000) {
    return sendApiError(res, 409, 'A record with that value already exists');
  }

  if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
    const message = error.name === 'TokenExpiredError'
      ? 'Token expired'
      : error.name === 'NotBeforeError' ? 'Token is not active yet' : 'Invalid token';
    return sendApiError(res, 401, message);
  }

  // Rate-limit middleware errors expose statusCode rather than status.
  const status = Number.isInteger(error.statusCode) ? error.statusCode : error.status;
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return sendApiError(res, status, error.message || 'Request could not be processed');
  }

  // Never send internal exception messages or stack traces to clients.
  return sendApiError(res, 500, 'An unexpected error occurred', 'Internal Server Error');
}
