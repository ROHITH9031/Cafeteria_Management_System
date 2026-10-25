import express from 'express';
import { randomUUID } from 'node:crypto';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { isDatabaseConnected } from './config/db.js';
import { createRateLimiter } from './middleware/rateLimits.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { requestLogger } from './middleware/requestLogger.js';

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
app.use((req, res, next) => {
  const requestId = randomUUID();
  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
});
app.use(requestLogger);
app.use(cors({
  origin: allowedOrigins,
}));
const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: 'Too many requests. Please try again later.',
});
app.use(['/api', '/auth', '/menu', '/orders'], apiRateLimiter);
app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', authRoutes);
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
// Keep older deployed frontend bundles functional while they are redeployed.
app.use('/auth', authRoutes);
app.use('/menu', menuRoutes);
app.use('/orders', orderRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
