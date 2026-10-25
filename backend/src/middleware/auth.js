import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendApiError } from './errors.js';

export function requireAuth(req, res, next) {
  const header = req.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return sendApiError(res, 401, 'Authentication required');

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return sendApiError(res, 401, 'Invalid or expired token');
  }
}

export function optionalAuth(req, res, next) {
  const header = req.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.jwtSecret);
  } catch {
    return sendApiError(res, 401, 'Invalid or expired token');
  }
  return next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return sendApiError(res, 403, 'Admin access required');
  }
  return next();
}
