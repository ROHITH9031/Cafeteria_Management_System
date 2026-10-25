import rateLimit from 'express-rate-limit';
import { sendApiError } from './errors.js';

export function createRateLimiter({ windowMs, limit, message, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => sendApiError(res, 429, message),
  });
}
