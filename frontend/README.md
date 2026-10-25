# SRKR Cafeteria

SRKR Cafeteria is a smart food ordering and token management frontend for the SRKR Engineering College cafeteria. It is designed to reduce queues at the billing counter and food collection counter by allowing students to browse the menu, place orders, receive a token, and follow preparation progress from their devices.

This repository currently contains the frontend prototype. It uses local mock services and browser storage so the complete customer and cafeteria staff experience can be demonstrated before the MERN backend is added.

## Product Theme

The application follows a warm, modern cafeteria and SaaS dashboard visual language:

- Orange and amber brand accents inspired by fresh food and energy.
- Inter for readable interface text and Outfit for headings and important numbers.
- Rounded cards, clear status badges, soft borders, and restrained shadows.
- Responsive layouts for phones, tablets, laptops, and desktop screens.
- Token-first order tracking so customers and staff can identify orders quickly.

## Main Experiences

### Customer experience

- Landing page explaining the queue-free ordering flow.
- Menu browsing with:
  - Search
  - Category filters
  - Price, name, and popularity sorting
  - Featured and popular item labels
  - Availability indicators
- Persistent shopping cart with quantity controls and INR totals.
- Checkout form for student name, student ID, and optional contact information.
- Demo pay-at-counter checkout; no real payment details are collected.
- Unique order token shown after checkout.
- Order history and order detail pages.
- Preparation progress tracking across:
  - Pending
  - Preparing
  - Ready
  - Completed
  - Delivered
  - Cancelled

### Admin experience

- Frontend-only demo login with a protected admin layout.
- Dashboard metrics calculated from shared order data:
  - Total orders
  - Pending orders
  - Preparing orders
  - Ready orders
  - Completed orders
  - Delivered orders
  - Demo revenue
- Order management with:
  - Token and customer search
  - Status filters
  - Newest/oldest sorting
  - Order detail modal
  - Status progression controls
- Menu management with:
  - Add and edit item forms
  - Price, category, image, description, and preparation time editing
  - Availability toggling
  - Popular and featured flags
  - Delete confirmation
  - Reset-demo-menu action

Admin status updates use the same shared order state as the customer pages, so changes are visible in the customer order tracker.

## Routes

### Customer routes

| Route | Purpose |
| --- | --- |
| `/` | Customer landing page |
| `/menu` | Food menu and item browsing |
| `/cart` | Cart and checkout |
| `/orders` | Customer order history |
| `/orders/:orderId` | Token and status tracking |

### Admin routes

| Route | Purpose |
| --- | --- |
| `/admin/login` | Demo admin sign-in |
| `/admin` | Admin overview dashboard |
| `/admin/orders` | Order queue and status management |
| `/admin/menu` | Menu catalog management |

## Technology Stack

- React 19
- Vite
- JavaScript and JSX
- React Router
- React Context API
- Lucide React icons
- Tailwind CSS v4 through the Vite plugin
- LocalStorage for frontend persistence

## Project Structure

```text
src/
├── components/
│   └── common/       Shared images, status badges, dialogs, and toast UI
├── context/          Auth, cart, menu, and order state providers
├── data/             Centralized mock cafeteria menu
├── layouts/          Customer and admin navigation shells
├── pages/            Customer and admin route screens
├── services/         Local menu, order, and storage service abstractions
├── utils/            Currency, date, and token utilities
├── App.jsx           Application routes and providers
├── index.css         Theme tokens, compatibility utilities, and base styles
└── main.jsx          React application entry point
```

## Getting Started

From the frontend directory:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, normally:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Demo Admin Credentials

Use these credentials at `/admin/login`:

```text
Email:    admin@srkrcafeteria.demo
Password: AdminDemo123!
```

This is simulated frontend authentication for demonstration only. The password is checked in the application and is not stored in LocalStorage. Frontend route guards do not replace backend authorization.

## Mock Data and Persistence

The frontend uses LocalStorage to simulate backend persistence:

- `srkr_menu_data` stores menu edits and availability.
- `srkr_cart_data` stores the current cart.
- `srkr_orders_data` stores created orders and status updates.
- `srkr_admin_auth` stores the demo admin session without the password.
- `srkr_token_counter` supports local demo token generation.

The order token and ID generators are isolated in utility/service modules so they can later be replaced with backend-generated identifiers.

LocalStorage is device-specific and is not globally unique or safe for concurrent production orders. The backend must become the authoritative source for prices, availability, order IDs, tokens, and permissions.

## Order Status Workflow

The admin order workflow is:

```text
Pending → Preparing → Ready → Completed → Delivered
```

Orders can also be marked `Cancelled` where appropriate. Completed orders are preserved in order history rather than deleted.

## Important Demo Limitations

- No backend API is included.
- No MongoDB, Express, Mongoose, JWT, or real authentication is included.
- No real payment processing is included.
- Menu images use remote demo URLs and include a visual fallback if an image fails.
- LocalStorage data belongs only to the current browser profile.
- The frontend mock token generator cannot guarantee global uniqueness.

## Future MERN Integration

The service layer is intentionally separated from the UI so it can be connected to a backend without rewriting the page components. Future API-backed operations should include:

- `getMenuItems()`
- `getMenuItemById(id)`
- `createMenuItem(itemData)`
- `updateMenuItem(itemId, itemData)`
- `deleteMenuItem(itemId)`
- `getOrders()`
- `getOrderById(id)`
- `createOrder(orderData)`
- `updateOrderStatus(orderId, status)`

The future backend should validate authentication, roles, inventory availability, prices, payment state, order transitions, and globally unique tokens.

## Quality Checks

Before sharing a change, run:

```bash
npm run lint
npm run build
```

The application is considered ready for the current frontend phase when both commands complete successfully.
