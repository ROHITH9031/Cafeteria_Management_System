# SRKR Cafeteria API

Node.js, Express, and MongoDB backend for the SRKR Cafeteria ordering application.

## Features

- JWT authentication for customers and administrators
- MongoDB-backed menu catalog
- Admin menu CRUD operations
- Customer order creation with server-side prices and availability checks
- Parcel and Dine-in order types
- Order history and admin status management
- Security middleware with Helmet, CORS, request logging, and auth rate limiting

## Setup

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set a real `JWT_SECRET`, MongoDB connection string, and admin password in `.env`.
The JWT secret must contain at least 32 characters. Do not commit `.env` or share database credentials.
Set `MONGODB_DB_NAME=srkr_cafeteria` so menu items and orders are always written to the same database.

For the deployed frontend, configure these Render environment variables and redeploy the service:

```env
CLIENT_ORIGIN=https://cafeteria-management-system-vert.vercel.app
ALLOWED_ORIGINS=https://cafeteria-management-system-vert.vercel.app
```

Configure this Vercel environment variable and redeploy the frontend:

```env
VITE_API_URL=https://cafeteria-management-system-yz9e.onrender.com/api
```

The `/api` suffix is required, and the URL must not end with an extra slash.

Start MongoDB, then seed the menu and admin account:

```powershell
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`.

Verify that both the API and MongoDB are connected:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "srkr-cafeteria-api",
  "database": "connected"
}
```

If `database` is `disconnected`, check `MONGODB_URI`, MongoDB Atlas network access, and database-user permissions.

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register a customer |
| POST | `/api/auth/login` | Login and receive a JWT |
| GET | `/api/auth/me` | Read the current authenticated user |
| GET | `/api/menu` | List menu items |
| POST/PATCH/DELETE | `/api/menu` | Admin menu management |
| POST | `/api/orders` | Create an order |
| GET | `/api/orders/mine` | Read authenticated customer's orders |
| GET | `/api/orders` | Admin order queue |
| PATCH | `/api/orders/:id/status` | Admin status update |

The frontend now sends new orders and admin status changes to this API. The JWT is stored in the browser for the admin session. Older orders created before API integration may remain only in that browser's localStorage and are not automatically copied to MongoDB.
