# SRKR Cafeteria Management System

A smart food ordering, queue-less token pickup, and cafeteria operations management system developed for **SRKR Engineering College**.

The system replaces manual counter queues with digital ordering, persistent WebSocket notifications, scannable QR tokens for counter collection, customer camera price scanning upon order completion, and a responsive Dark Mode interface.

---

## Architecture Overview

```
Cafeteria_Management_System/
├── backend/                      # Node.js + Express + Socket.IO + MongoDB API
│   ├── src/
│   │   ├── config/               # Database and environment configuration
│   │   ├── middleware/           # Auth, security, and centralized error handling
│   │   ├── models/               # Mongoose schemas (User, MenuItem, Order)
│   │   ├── routes/               # API routes (Auth, Menu, Orders) with Socket emissions
│   │   ├── utils/                # JWT tokens, password hashing, seed data
│   │   └── server.js             # HTTP server with Socket.IO integration
│   └── test/                     # Node.js test runner unit test suites
│
└── frontend/                     # React 19 + Vite + Tailwind CSS v4 Single Page App
    ├── src/
    │   ├── components/common/    # QR Generator, Camera Scanners, Modals, Badges, ThemeToggle
    │   ├── context/              # Auth, Cart, Menu, Order, and Theme Contexts
    │   ├── layouts/              # CustomerLayout & AdminLayout
    │   ├── pages/                # Home, Menu, Cart, Orders, OrderDetails, Admin views, 404
    │   ├── services/             # API clients, storage, and socketService singleton
    │   └── index.css             # Tailwind CSS v4 styling & dark mode configuration
```

---

## Key Features

### 1. Real-Time Persistent WebSockets
- **Bi-directional event synchronization**:
  - `order:created`: Staff order queue updates automatically the instant a customer places an order.
  - `order:status_updated`: Pushed instantly to both staff and the specific customer's private room (`order:<id>`).
  - `menu:updated`: Broadcast globally to all connected browsers when an admin updates stock or prices.
- **Graceful fallback**: Automatic reconnection handling with backup 30-second polling only if connection drops.

### 2. Token-to-QR Pickup & Admin Handover Scanner
- **Customer Pickup QR (`OrderTokenQR`)**: The customer order details page renders a scannable, high-contrast QR code generated via `qrcode` with a full-screen enlargement mode for counter pickup.
- **Admin Handover Scanner (`AdminOrderScannerModal`)**: Cafeteria staff can click **"Scan Pickup QR"** on their dashboard to scan the customer's QR code via `html5-qrcode`, matching the order in the live queue for 1-click status advance.

### 3. Customer Camera Price Scanner upon Completion
- When an order reaches the `Completed` or `Delivered` state, the customer order page enables a camera scanner.
- The student can scan cafeteria counter payment QR codes (UPI `upi://pay?...&am=120`), printed counter bill barcodes, or price tags.
- Verifies the scanned amount against the order's `totalAmount`, emits an audio verification chime, and displays a verified settlement stamp.

### 4. Comprehensive Enhanced Dark Mode
- Full dark theme support across **all** customer and staff pages, modals, cards, badges, and inputs.
- Toggle between Light and Dark modes with persistent storage in `localStorage` and automatic sync with system OS preferences (`prefers-color-scheme: dark`).
- Configured using Tailwind CSS v4 class-based variant `@custom-variant dark (&:where(.dark, .dark *));`.

### 5. Smart Menu & Kitchen Fulfillment
- Searchable catalog by item name, description, and category (Tiffins, Fast Food, Meals & Curry, Tea & Coffee).
- Stock availability toggles that instantly mark items as available or unavailable across all devices.
- Support for **Dine-in** and **Parcel** serving selections.

---

## Quick Start

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB instance (Local or MongoDB Atlas)

### 1. Backend Setup
```powershell
cd backend
npm install
Copy-Item .env.example .env
```
Configure `JWT_SECRET` (at least 32 characters) and `MONGODB_URI` in `backend/.env`.

Seed the database and start the server:
```powershell
npm run seed
npm run dev
```
The backend API and Socket.IO server runs at `http://localhost:5000`.

### 2. Frontend Setup
In a new terminal window:
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Admin Account

Admin accounts are provisioned separately with the backend seed command. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` in `backend/.env` before running `npm run seed`. Customer registration does not create administrator accounts. Use the separate `/admin/login` page for staff access.

---

## Quality Verification

### Run Backend Tests
```powershell
cd backend
npm test
npm run lint
```

MongoDB integration tests run only when `MONGODB_TEST_URI` is set to a dedicated disposable test database. See [backend/README.md](backend/README.md) for backup/restore commands and report API details.

### Run Frontend Linter & Production Build
```powershell
cd frontend
npm run lint
npm run build
```

---

## License

Created for SRKR Engineering College Cafeteria Management.
