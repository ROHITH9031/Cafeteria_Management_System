import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}. Copy .env.example to .env and configure it before starting the API.`);
  }
}

if (process.env.MONGODB_URI.includes('<') || process.env.MONGODB_URI.includes('>')) {
  throw new Error('MONGODB_URI still contains placeholder values. Replace the database username and password with valid MongoDB credentials.');
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long.');
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  databaseName: process.env.MONGODB_DB_NAME || 'srkr_cafeteria',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'https://cafeteria-management-system-vert.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminEmail: process.env.ADMIN_EMAIL || 'admin@srkrcafeteria.demo',
  adminPassword: process.env.ADMIN_PASSWORD,
};
