import mongoose from 'mongoose';
import { env } from './env.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';

export async function connectDatabase() {
  await mongoose.connect(env.mongoUri, { dbName: env.databaseName });
  await MenuItem.updateMany({ stock: { $exists: false } }, { $set: { stock: 25 } });
  await MenuItem.updateMany({ dietaryTags: { $exists: false } }, { $set: { dietaryTags: [] } });
  await Order.updateMany({ stockDeducted: { $exists: false } }, { $set: { stockDeducted: false } });
  console.log(JSON.stringify({ level: 'info', event: 'database_connected', database: env.databaseName }));
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
