import { Router } from 'express';
import User from '../models/User.js';
import { comparePassword, createToken, hashPassword, publicUser } from '../utils/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { sendApiError } from '../middleware/errors.js';
import { createRateLimiter } from '../middleware/rateLimits.js';

const router = Router();
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many unsuccessful login attempts. Try again in 15 minutes.',
});
const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: 'Too many registration attempts. Try again in an hour.',
});

async function authenticateByRole(req, res, role) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    sendApiError(res, 401, 'Invalid email or password');
    return null;
  }
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+passwordHash');
  if (!user || user.role !== role || !(await comparePassword(password || '', user.passwordHash))) {
    sendApiError(res, 401, 'Invalid email or password');
    return null;
  }
  return { token: createToken(user), user: publicUser(user) };
}

router.post('/register', registrationRateLimiter, async (req, res) => {
  const { name, email, password, studentId, contactInfo } = req.body;
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string'
    || !name.trim() || !email.trim() || !password) {
    return sendApiError(res, 400, 'Name, email, and password are required');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return sendApiError(res, 400, 'Enter a valid email address');
  if (password.length < 8) return sendApiError(res, 400, 'Password must contain at least 8 characters');

  const user = await User.create({ name, email, passwordHash: await hashPassword(password), studentId, contactInfo });
  res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

router.post('/login', loginRateLimiter, async (req, res) => {
  const session = await authenticateByRole(req, res, 'customer');
  if (!session) return;
  return res.json(session);
});

router.post('/admin/login', loginRateLimiter, async (req, res) => {
  const session = await authenticateByRole(req, res, 'admin');
  if (!session) return;
  return res.json(session);
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return sendApiError(res, 404, 'User not found');
  return res.json({ user: publicUser(user) });
});

export default router;
