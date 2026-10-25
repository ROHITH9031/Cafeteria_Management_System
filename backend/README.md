# SRKR Cafeteria — Backend API

Node.js, Express, Socket.IO, and MongoDB backend for the SRKR Cafeteria smart food ordering and token management application.

---

## Features

- **JWT Authentication**: Secure user registration, login, and role-based access control (Customers and Admins) with bcrypt password hashing.
- **Persistent WebSockets (Socket.IO)**: Real-time bi-directional event communication for instant order updates without constant client polling.
  - `join:admin` room: Cafeteria staff receives real-time `order:created` and `order:status_updated` events.
  - `join:order` / `leave:order` private rooms: Customers receive scoped `order:status_updated` events exclusively for their order.
  - Global broadcast: `menu:updated` alerts all connected browsers when catalog availability or prices change.
- **MongoDB-Backed Catalog**: Seeded menu catalog with categories (Tiffins, Fast Food, Meals & Curry, Tea & Coffee), dietary info, and stock availability toggles.
- **MongoDB Reads**: Menu and order data are read directly from MongoDB. Socket.IO uses its built-in in-memory adapter and supports a single backend instance.
- **Admin Menu CRUD Operations**: Add, update, delete, toggle availability/popular/featured flags, or reset to original demo items.
- **Customer Order Processing**: Server-side price recalculation, stock availability verification, and support for Dine-in and Parcel servings.
- **Inventory Tracking**: Stock is reserved atomically per menu item at order creation and restored after a successful pending-order cancellation. Checkout quotes show current server prices and availability.
- **Sales Reports**: Admin reports aggregate date-filtered revenue, order counts, daily sales, popular items, and status counts across all matching database records; CSV export is available in the admin dashboard.
- **Filtered Order Queue**: Server-side status, text, and date filters with cursor pagination, matching totals, active-order counts, and bulk status changes.
- **Role-Separated Sign-In**: Customer registration creates customer accounts only; admins sign in through the separate admin login route.
- **Efficient Database Queries**: Paginated order history and staff queues, lean read-only queries, focused projections, and indexes for common sort and filter patterns.
- **Order Token Generation**: Unique token assignment for every order for kitchen tracking and counter collection.
- **Centralized Error Handling**: Consistent JSON errors for invalid requests, authentication failures, validation and duplicate records, malformed or oversized request bodies, rate limits, and unexpected server errors. Internal exception details stay in server logs; clients receive a request ID for support.
- **Security Middleware**: Helmet header protection, CORS origin whitelisting, request logging, and API plus authentication rate limiting.

---

## WebSocket Events

| Event Name | Direction | Room / Target | Payload / Purpose |
| --- | --- | --- | --- |
| `join:admin` | Client → Server | Socket | Admin joins staff broadcast room |
| `join:order` | Client → Server | `order:<orderId>` | Customer subscribes to private order status room |
| `leave:order` | Client → Server | `order:<orderId>` | Customer unsubscribes from order room |
| `order:created` | Server → Client | `admin` | Notifies staff dashboard of new incoming customer order |
| `order:status_updated` | Server → Client | `admin`, `order:<id>` | Broadcasts status advancement (e.g. Preparing, Ready, Completed) |
| `menu:updated` | Server → Client | Global (all sockets) | Broadcasts catalog changes so clients auto-refresh menu |

---

## Setup & Running

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set a real `JWT_SECRET`, MongoDB connection string (`MONGODB_URI`), and admin credentials in `.env`:
- `JWT_SECRET` must contain at least 32 characters.
- Set `MONGODB_DB_NAME=srkr_cafeteria` so menu items and orders are written to the correct database.

### Seed Database and Start Server

```powershell
npm run seed
npm run dev
```

The API and Socket.IO server runs at `http://localhost:5000`.

### Health Check

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "srkr-cafeteria-api",
  "database": "connected",
  "databaseName": "srkr_cafeteria"
}
```

---

## API Endpoints

API errors use `{ "status", "error", "message" }`, with an optional `errors` list for field validation and a `requestId` for tracing server-side logs. Unexpected failures return a generic `500` message. Logs include the request ID, error type, and safe error code without logging raw exception messages or request secrets. Every response includes the matching `X-Request-Id` header.

### Rate Limits

- All `/api` endpoints and the legacy `/auth`, `/menu`, and `/orders` routes share a limit of **300 requests per IP per 15 minutes**.
- Customer and admin login endpoints allow **10 unsuccessful attempts per IP per 15 minutes**. Successful logins do not count toward this limit.
- `POST /api/auth/register` and `POST /auth/register` allow **5 attempts per IP per hour**.
- A blocked request returns HTTP `429` in the standard API error format and includes `RateLimit` headers describing the limit and reset window. Limits use an in-memory store, so counts reset when the backend restarts and are not shared across multiple backend instances.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Service health & database connectivity check |
| POST | `/api/auth/register` | Public | Register customer account |
| POST | `/api/auth/login` | Public | Sign in and receive JWT token |
| POST | `/api/auth/admin/login` | Public | Sign in to the separate admin session |
| GET | `/api/auth/me` | Authenticated | Read current user profile |
| GET | `/api/menu` | Public | Retrieve active cafeteria catalog |
| GET | `/api/menu?minPrice=50&maxPrice=200&dietary=Vegetarian,Vegan` | Public | Filter by price range and required dietary tags |
| POST | `/api/menu` | Admin | Create a new menu item |
| PATCH | `/api/menu/:itemId` | Admin | Update item properties (stock, price, tags) |
| DELETE | `/api/menu/:itemId` | Admin | Remove item from catalog |
| POST | `/api/menu/reset` | Admin | Reset menu to initial demo seed |
| POST | `/api/orders` | Public / Customer | Create order with server-validated pricing |
| POST | `/api/orders/quote` | Public / Customer | Check current prices and stock before order submission |
| GET | `/api/orders/mine` | Customer | Retrieve authenticated customer's order history |
| GET | `/api/orders` | Admin | Retrieve all orders for staff queue |
| GET | `/api/orders/reports?from=2026-10-01&to=2026-10-26` | Admin | Date-filtered sales and item report |
| PATCH | `/api/orders/bulk/status` | Admin | Update selected orders in one request (up to 100 IDs) |
| GET | `/api/orders/:id` | Public / Customer | Retrieve single order details by MongoDB ID |
| PATCH | `/api/orders/:id/status` | Admin | Advance order status (`Pending` → `Preparing` → `Ready` → `Completed`) |
| PATCH | `/api/orders/:id/cancel` | Customer / Admin | Cancel a pending order |

Order list endpoints accept `limit` (default 50, maximum 100) and an opaque `cursor` returned by the previous page. The admin queue accepts `status`, `q`, `from`, and `to` filters. Responses include `orders`, `hasMore`, `nextCursor`, and counts computed over all matching records (not just the current page). Date filters use inclusive UTC calendar dates.

The report endpoint returns all status counts and excludes cancelled orders from revenue, daily sales, and popular item calculations. Stock-reserving order creation is atomic for each menu item; the application compensates for reservation failures. For crash-safe multi-document transactions, configure MongoDB as a replica set before extending reservation writes across multiple items into a database transaction.

### Structured logs

Each completed HTTP request writes one JSON line to stdout with the request ID, method, path, response status, and duration. API errors write a JSON error record with the same request ID. Use the request ID returned in the response header when tracing a failure in deployment logs.

### MongoDB backup and restore

Install MongoDB Database Tools on the server or operator workstation. Keep backup files outside the web root and protect them like production data. The commands below use the configured database name and prompt for credentials when applicable:

```powershell
$env:MONGODB_DB_NAME = "srkr_cafeteria"
mongodump --uri="$env:MONGODB_URI" --db="$env:MONGODB_DB_NAME" --archive="cafeteria-backup.archive.gz" --gzip
mongorestore --uri="$env:MONGODB_URI" --db="$env:MONGODB_DB_NAME" --archive="cafeteria-backup.archive.gz" --gzip --drop
```

For scheduled backups, store archives on a separate encrypted volume or managed backup service, retain multiple dated copies, and periodically restore an archive into a separate test database. A `--drop` restore replaces collections in the destination database.

---

## Testing & Quality Checks

Run backend tests (MongoDB integration tests are skipped unless `MONGODB_TEST_URI` points to a dedicated disposable test database):
```powershell
npm test
```

Run linter:
```powershell
npm run lint
```
