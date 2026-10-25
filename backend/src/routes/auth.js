import { Router } from 'express';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { comparePassword, createToken, hashPassword, publicUser } from '../utils/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password, studentId, contactInfo } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters' });

  const user = await User.create({ name, email, passwordHash: await hashPassword(password), studentId, contactInfo });
  res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+passwordHash');
  if (!user || !(await comparePassword(password || '', user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  return res.json({ token: createToken(user), user: publicUser(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: publicUser(user) });
});

router.get('/demo-credentials', (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).end();
  return res.json({ email: env.adminEmail, configured: Boolean(env.adminPassword) });
});

export default router;
