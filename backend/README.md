# VELN — Backend

Express 5 REST API with MySQL 8, TypeScript, and JWT authentication.

---

## Stack

- **Runtime:** Node.js 20 + TypeScript (compiled with `tsx` in dev, `tsc` for production)
- **Framework:** Express 5
- **Database:** MySQL 8 via `mysql2/promise` — raw SQL, no ORM
- **Auth:** `jsonwebtoken` + `bcryptjs`
- **Validation:** Zod 4
- **File uploads:** Multer (stored in `./uploads/`)

---

## Getting started

```bash
cp .env.example .env   # fill in DB_USER and JWT_SECRET at minimum
npm install
npm run dev            # tsx watch — auto-restarts on file changes
```

The server starts on `http://localhost:3001` by default.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start in watch mode with `tsx` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output from `dist/` |
| `npm run typecheck` | Type-check without emitting files |
| `npm run lint` | ESLint over `src/` |

---

## Environment variables

Copy `.env.example` to `.env` and fill in:

```
JWT_SECRET=          # required — use openssl rand -hex 32
DB_USER=             # required — MySQL username
DB_PASSWORD=         # optional — empty string accepted for local dev
DB_HOST=localhost
DB_PORT=3306
DB_NAME=veln_db
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:5173
UPLOAD_DIR=./uploads
```

`JWT_SECRET` and `DB_USER` are validated at startup. The process exits immediately with a descriptive error if either is missing. See `src/config/env.ts`.

---

## Project structure

```
src/
├── config/
│   └── env.ts              # Fail-fast env validator — imported first in index.ts
├── db/
│   ├── connection.ts        # mysql2 connection pool
│   └── schema.sql           # CREATE TABLE + seed data — run once to init DB
├── middlewares/
│   ├── auth.ts              # authenticateJWT — verifies Bearer token, sets req.user
│   ├── admin.ts             # requireAdmin — checks req.user.role === 'admin'
│   └── validate.ts          # validateBody(schema) — Zod request body validator
├── routes/
│   ├── auth.routes.ts
│   ├── products.routes.ts
│   ├── categories.routes.ts
│   ├── cart.routes.ts
│   ├── orders.routes.ts
│   ├── wishlist.routes.ts
│   └── admin.routes.ts
├── controllers/             # Thin: extract params → call service → return JSON
│   └── *.controller.ts
├── services/                # Business logic + all SQL queries
│   └── *.service.ts
├── schemas/                 # Zod schemas (source of truth for input types)
│   └── *.schema.ts
├── types/
│   └── express.d.ts         # Augments Express.Request with user?: { id, role }
└── index.ts                 # App entry — registers routes, global error handler
```

---

## API endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register new user |
| `POST` | `/api/auth/login` | — | Returns JWT |
| `GET` | `/api/auth/me` | JWT | Current user info |

### Products

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | — | List active products. `?category=slug` to filter |
| `GET` | `/api/products/:id` | — | Product detail |
| `POST` | `/api/products` | Admin | Create product (`multipart/form-data`) |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Soft delete (`active = 0`) |

### Cart

All cart endpoints require JWT.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/cart` | Get cart items |
| `POST` | `/api/cart` | Add item `{ productId, quantity }` |
| `PUT` | `/api/cart/:productId` | Update quantity `{ quantity }` |
| `DELETE` | `/api/cart` | Clear entire cart |
| `DELETE` | `/api/cart/:productId` | Remove one item |

### Orders

All order endpoints require JWT.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/orders` | User's order history |
| `GET` | `/api/orders/:id` | Order detail with items |
| `POST` | `/api/orders` | Create order from current cart |

`POST /api/orders` runs inside a MySQL transaction: inserts order, inserts order_items (capturing `unit_price` at purchase time), decrements stock, then clears the cart.

### Wishlist

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/wishlist` | JWT | Get saved product IDs |
| `POST` | `/api/wishlist/:productId` | JWT | Toggle (add if absent, remove if present) |

### Admin

All admin endpoints require JWT + `role = 'admin'`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/orders` | All orders with user email |
| `PUT` | `/api/admin/orders/:id` | Update order status |
| `GET` | `/api/admin/inventory` | All products with stock |
| `PUT` | `/api/admin/inventory/:id` | Update product stock |

---

## Database

Run `src/db/schema.sql` once against your MySQL instance:

```bash
mysql -u root -p < src/db/schema.sql
```

### Tables

| Table | Description |
|---|---|
| `users` | Accounts with role `customer` or `admin` |
| `categories` | Product categories with a unique slug |
| `products` | Catalog with soft delete (`active`) |
| `cart_items` | Per-user cart; unique constraint on `(user_id, product_id)` |
| `wishlists` | Same structure as cart without quantity |
| `orders` | Order header with status and payment fields |
| `order_items` | Line items with `unit_price` captured at purchase time |

---

## Conventions

- **No ORM.** All queries use `pool.execute()` with `?` placeholders.
- **Controllers are thin.** They extract params from `req`, call a service function, and return `res.json()`. No SQL in controllers.
- **Error responses** always use `{ error: string }` with the appropriate HTTP status.
- **No `any`.** TypeScript strict mode is enabled. Use `unknown` with type narrowing.
