import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  await mongoose.connect(env.mongoUri, { dbName: env.databaseName });
  console.log(`MongoDB connected to database "${env.databaseName}"`);
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
