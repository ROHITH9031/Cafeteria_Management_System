import http from 'node:http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

try {
  await connectDatabase();
} catch (error) {
  console.error(JSON.stringify({
    level: 'error',
    event: 'database_connection_failed',
    errorName: error.name || 'Error',
    code: typeof error.code === 'string' || typeof error.code === 'number' ? error.code : undefined,
  }));
  process.exit(1);
}

const server = http.createServer(app);

const allowedOrigins = [
  env.clientOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  ...env.allowedOrigins,
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  // Staff joins the admin room
  socket.on('join:admin', () => {
    socket.join('admin');
  });

  // Client joins specific order room
  socket.on('join:order', (orderId) => {
    if (orderId) {
      socket.join(`order:${orderId}`);
    }
  });

  socket.on('leave:order', (orderId) => {
    if (orderId) {
      socket.leave(`order:${orderId}`);
    }
  });
});

server.listen(env.port, () => console.log(JSON.stringify({ level: 'info', event: 'server_listening', port: env.port })));
