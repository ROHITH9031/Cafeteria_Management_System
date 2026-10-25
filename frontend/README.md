# SRKR Cafeteria — Frontend

SRKR Cafeteria is a modern food ordering, live token tracking, and queue-free pickup web application built for the students, faculty, and cafeteria staff of SRKR Engineering College.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Socket.IO**, the application connects seamlessly with the Node.js/Express backend API for real-time order progression, scannable QR tokens, camera bill scanning, and responsive Dark Mode.

---

## Key Features

### 1. Real-Time Persistent Connections (WebSockets)
- Centralized Socket.IO client singleton (`services/socketService.js`) with automatic reconnection and fallback transport.
- Staff dashboard receives instant `order:created` events when customers check out without manual refresh.
- Customer order page subscribes to private rooms (`order:<id>`) and receives instant `order:status_updated` push notifications.
- Visual connectivity indicator badge displaying *Live persistent connection* or fallback mode.
- Global `menu:updated` listener automatically refreshes the catalog when an admin changes item stock or price.

### 2. Token-to-QR Pickup System (`OrderTokenQR`)
- On the customer order tracking page (`/orders/:orderId`), the order token is rendered as a scannable, high-contrast QR code generated via `qrcode`.
- Encodes full order verification data (token, order ID, customer name, total amount) for cafeteria staff verification.
- Includes **Pickup QR / Token Number** toggle switch and a **Tap to Enlarge** full-screen display mode for effortless counter scanning from any angle.

### 3. Admin Order Handover Scanner (`AdminOrderScannerModal`)
- Staff order management dashboard (`/admin/orders`) features a **"Scan Pickup QR"** camera scanner powered by `html5-qrcode`.
- Staff points their camera at the student's phone screen to scan their pickup QR code.
- Instantly matches the order in the live queue and provides a 1-click **"Mark as Completed / Handed Over"** button.
- Includes simulated active order scanning for testing without hardware cameras.

### 4. Camera Price Scanner upon Order Completion (`PriceCameraScanner`)
- When an order reaches the `Completed` or `Delivered` state, the customer order page enables a dedicated camera scanner.
- The student can scan cafeteria counter payment QR codes (UPI `upi://pay?...&am=120`), printed counter bill barcodes, or price tags.
- Automatically extracts the price amount, checks it against the order's `totalAmount`, and plays an audio verification chime via the Web Audio API.
- Confirms whether the scanned price matches the billed total or flags discrepancies.

### 5. Enhanced Dark Mode
- Full dark mode system powered by `ThemeContext` and `ThemeToggle`.
- Persists user preference to `localStorage` and automatically syncs with system OS preferences (`prefers-color-scheme: dark`).
- Configured via Tailwind CSS v4 class-based variant `@custom-variant dark (&:where(.dark, .dark *));`.
- Complete dark palette styling across **all** customer pages, admin dashboard, order queue, menu editor, modals, badges, 404 page, and error boundary.

### 6. Customer Experience
- Modern landing page with cafeteria status, 3-step queue-free guide, category browsing, and featured items.
- Menu catalog with category/search/sort, price range and combined dietary filters, stock-aware availability, and low-stock hints.
- Checkout verifies contact details and requests current server-side stock and prices before order submission; failed requests keep the cart for retry.
- Persistent shopping cart with item quantity controls (up to 50 items) and Dine-in / Parcel order type options.
- Student authentication modal for registration and login, with auto-fill in checkout.
- Order history and status tracking stepper across `Pending`, `Preparing`, `Ready`, `Completed`, and `Delivered`.
- Cancellation capability for pending orders.

### 7. Staff & Admin Operations
- Secure JWT-authenticated login (`/admin/login`) with role guard redirect.
- Admin sales reports with date range, all-record revenue/order/item aggregates, daily sales, status counts, and CSV export.
- Live order queue with server-side search, status/date filters, accurate matching/active counts, pagination, and bulk status updates.
- Menu management with CRUD operations, stock quantities, dietary tags, and combinable filters with reset.

---

## Routes

### Customer Routes

| Route | Purpose |
| --- | --- |
| `/` | Cafeteria landing page with featured items and 3-step guide |
| `/menu` | Searchable food catalog with category filters & sorting |
| `/cart` | Cart management, Dine-in/Parcel choice, and checkout |
| `/orders` | Customer order history with live status badges |
| `/orders/:orderId` | Live order details, scannable pickup QR, and camera price scanner |
| `*` | Custom 404 page with navigation shortcuts |

### Admin Routes

| Route | Purpose |
| --- | --- |
| `/admin/login` | Separate secure staff authentication |
| `/admin` | Real-time operations dashboard, metrics, and revenue charts |
| `/admin/orders` | Live WebSocket order queue, status progression, and pickup QR scanner |
| `/admin/menu` | Catalog editor, stock toggles, price updates, and demo reset |

---

## Technology Stack

- **React 19**
- **Vite**
- **Tailwind CSS v4** (with `@custom-variant dark` support)
- **React Router DOM v7**
- **Socket.IO Client (`socket.io-client`)**
- **`qrcode`** (Vector & Canvas QR generation)
- **`html5-qrcode`** (Camera barcode & QR scanning)
- **Lucide React** (Icons)
- **Context API** (`AuthContext`, `CartContext`, `MenuContext`, `OrderContext`, `ThemeContext`)

---

## Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

Ensure the backend server is running on `http://localhost:5000` for live database access and WebSocket events.

---

## Quality Checks

Run linter:
```bash
npm run lint
```

Run production build:
```bash
npm run build
```
