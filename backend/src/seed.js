import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mockMenu from '../../frontend/src/data/mockMenu.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import MenuItem from './models/MenuItem.js';
import User from './models/User.js';

await connectDatabase();
await MenuItem.bulkWrite(mockMenu.map((item) => ({
  updateOne: { filter: { itemId: item.id }, update: { $set: { itemId: item.id, name: item.name, description: item.description, price: item.price, category: item.category, image: item.image, available: item.available, popular: item.popular, featured: item.featured, preparationTime: item.preparationTime }, $setOnInsert: { stock: item.stock ?? 25, dietaryTags: item.dietaryTags || [] } }, upsert: true },
})));

if (!env.adminPassword) {
  throw new Error('ADMIN_PASSWORD is required to seed the admin account. Add ADMIN_EMAIL and ADMIN_PASSWORD to backend/.env.');
}

await User.updateOne(
  { email: env.adminEmail.toLowerCase() },
  { $set: { name: 'Admin', email: env.adminEmail.toLowerCase(), passwordHash: await bcrypt.hash(env.adminPassword, 12), role: 'admin' } },
  { upsert: true }
);

console.log(`Seeded ${mockMenu.length} menu items`);
await mongoose.disconnect();
