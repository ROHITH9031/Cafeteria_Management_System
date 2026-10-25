import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const header = req.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function optionalAuth(req, res, next) {
  const header = req.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.jwtSecret);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  return next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
}
