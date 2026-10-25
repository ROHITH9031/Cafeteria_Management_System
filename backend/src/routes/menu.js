import { Router } from 'express';
import MenuItem from '../models/MenuItem.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import mockMenu from '../../../frontend/src/data/mockMenu.js';
import { sendApiError } from '../middleware/errors.js';

const router = Router();
const menuResponseFields = 'itemId name description price category image available popular featured preparationTime stock dietaryTags';

router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category && req.query.category !== 'All') {
    if (typeof req.query.category !== 'string') return sendApiError(res, 400, 'Invalid category filter');
    filter.category = req.query.category;
  }
  if (req.query.available === 'true') {
    filter.available = true;
    filter.stock = { $gt: 0 };
  }
  const minPrice = req.query.minPrice === undefined ? undefined : Number(req.query.minPrice);
  const maxPrice = req.query.maxPrice === undefined ? undefined : Number(req.query.maxPrice);
  if ((minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0))
    || (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0))
    || (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)) {
    return sendApiError(res, 400, 'Invalid price range');
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }
  if (req.query.dietary) {
    const tags = String(req.query.dietary).split(',').map((tag) => tag.trim()).filter(Boolean);
    if (tags.length > 0) filter.dietaryTags = { $all: tags };
  }

  const items = (await MenuItem.find(filter)
    .select(menuResponseFields)
    .sort({ category: 1, name: 1 })
    .lean()).map((item) => ({ ...item, available: item.available && item.stock > 0 }));
  return res.json({ items });
});

router.get('/:itemId', async (req, res) => {
  const item = await MenuItem.findOne({ itemId: req.params.itemId }).select(menuResponseFields).lean();
  if (!item) return sendApiError(res, 404, 'Menu item not found');
  return res.json({ item });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const itemData = {
    ...req.body,
    itemId: req.body.itemId || req.body.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    stock: req.body.stock ?? 25,
    dietaryTags: req.body.dietaryTags || [],
  };
  const item = await MenuItem.create(itemData);

  const io = req.app.get('io');
  if (io) io.emit('menu:updated');

  res.status(201).json({ item });
});

router.post('/reset', requireAuth, requireAdmin, async (req, res) => {
  await MenuItem.deleteMany({});
  await MenuItem.bulkWrite(
    mockMenu.map((item) => ({
      updateOne: {
        filter: { itemId: item.id },
        update: {
          $set: {
            itemId: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image,
            available: item.available,
            popular: item.popular,
            featured: item.featured,
            preparationTime: item.preparationTime,
            stock: item.stock ?? 25,
            dietaryTags: item.dietaryTags || [],
          },
        },
        upsert: true,
      },
    }))
  );
  const items = await MenuItem.find().select(menuResponseFields).sort({ category: 1, name: 1 }).lean();

  const io = req.app.get('io');
  if (io) io.emit('menu:updated');

  return res.json({ items });
});

router.patch('/:itemId', requireAuth, requireAdmin, async (req, res) => {
  const item = await MenuItem.findOneAndUpdate({ itemId: req.params.itemId }, req.body, { new: true, runValidators: true });
  if (!item) return sendApiError(res, 404, 'Menu item not found');

  const io = req.app.get('io');
  if (io) io.emit('menu:updated');

  return res.json({ item });
});

router.delete('/:itemId', requireAuth, requireAdmin, async (req, res) => {
  const item = await MenuItem.findOneAndDelete({ itemId: req.params.itemId });
  if (!item) return sendApiError(res, 404, 'Menu item not found');

  const io = req.app.get('io');
  if (io) io.emit('menu:updated');

  return res.status(204).end();
});

export default router;
