import { Router } from 'express';
import MenuItem from '../models/MenuItem.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
  if (req.query.available === 'true') filter.available = true;
  res.json({ items: await MenuItem.find(filter).sort({ category: 1, name: 1 }) });
});

router.get('/:itemId', async (req, res) => {
  const item = await MenuItem.findOne({ itemId: req.params.itemId });
  if (!item) return res.status(404).json({ message: 'Menu item not found' });
  return res.json({ item });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const item = await MenuItem.create(req.body);
  res.status(201).json({ item });
});

router.patch('/:itemId', requireAuth, requireAdmin, async (req, res) => {
  const item = await MenuItem.findOneAndUpdate({ itemId: req.params.itemId }, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Menu item not found' });
  return res.json({ item });
});

router.delete('/:itemId', requireAuth, requireAdmin, async (req, res) => {
  const item = await MenuItem.findOneAndDelete({ itemId: req.params.itemId });
  if (!item) return res.status(404).json({ message: 'Menu item not found' });
  return res.status(204).end();
});

export default router;
