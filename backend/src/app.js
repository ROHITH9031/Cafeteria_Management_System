import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { isDatabaseConnected } from './config/db.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
const allowedOrigins = [
  env.clientOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  ...env.allowedOrigins,
];

app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('combined'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.get('/api/health', (req, res) => {
  const database = isDatabaseConnected();
  return res.status(database ? 200 : 503).json({
    status: database ? 'ok' : 'degraded',
    service: 'srkr-cafeteria-api',
    database: database ? 'connected' : 'disconnected',
    databaseName: env.databaseName,
  });
});
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
