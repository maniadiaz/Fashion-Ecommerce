# VELN — Backend

Express 5 REST API with MySQL 8, TypeScript, and JWT authentication.

---

## Stack

- **Runtime:** Node.js 20 + TypeScript (dev: `tsx watch`, prod: compiled `dist/`)
- **Framework:** Express 5
- **Database:** MySQL 8 via `mysql2/promise` — raw SQL, no ORM
- **Auth:** `jsonwebtoken` + `bcryptjs`
- **Validation:** Zod 4
- **File uploads:** Multer (stored in `./uploads/`)
- **Email:** Nodemailer (optional — used for password reset flow)

---

## Getting started

```bash
cp .env.example .env   # fill in DB_USER and JWT_SECRET at minimum
npm install
npm run dev            # tsx watch — auto-restarts on file changes
```

The server starts on `http://localhost:3001` by default.

On startup, `migrate()` runs automatically before the port opens:
1. Applies `schema.sql` (idempotent — `CREATE TABLE IF NOT EXISTS`, `INSERT IGNORE`)
2. Adds a `UNIQUE` constraint on `products.name` if not present
3. Removes any duplicate product rows (legacy from old seed runs), keeping the oldest
4. Corrects `category_id` values for seeded products using slug lookups

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start in watch mode with `tsx` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output from `dist/index.js` |
| `npm run typecheck` | Type-check without emitting files |
| `npm run lint` | ESLint over `src/` |
| `npm run seed` | Run `src/db/seed.ts` manually (dev only) |

---

## Environment variables

Copy `.env.example` to `.env` and fill in:

```
JWT_SECRET=          # required — use: openssl rand -hex 32
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
│   ├── migrate.ts           # Runs schema + post-migration fixes on startup
│   ├── schema.sql           # CREATE TABLE + seed data (idempotent)
│   └── seed.ts              # Manual seed script (npm run seed)
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
└── index.ts                 # App entry — registers routes, runs migrate, listens
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
| `GET` | `/api/products` | — | List active products. `?category=slug` filters by category |
| `GET` | `/api/products/:id` | — | Product detail — returns `{ product }` |
| `POST` | `/api/products` | Admin | Create product (`multipart/form-data`) |
| `PUT` | `/api/products/:id` | Admin | Update product fields |
| `DELETE` | `/api/products/:id` | Admin | Soft delete (`active = 0`) |

### Categories

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/categories` | — | All categories — returns `{ categories }` |

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

`POST /api/orders` runs inside a MySQL transaction: inserts order header, inserts order_items (capturing `unit_price` at purchase time), decrements stock for each item, then clears the cart.

### Wishlist

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/wishlist` | JWT | Get saved product IDs |
| `POST` | `/api/wishlist/:productId` | JWT | Toggle — adds if absent, removes if present |

### Admin

All admin endpoints require JWT + `role = 'admin'`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/orders` | All orders with user info |
| `PUT` | `/api/admin/orders/:id` | Update order status |
| `GET` | `/api/admin/inventory` | All products with current stock |
| `PUT` | `/api/admin/inventory/:id` | Update product stock |
| `GET` | `/api/admin/promotions` | List promotions |
| `POST` | `/api/admin/promotions` | Create promotion |
| `PUT` | `/api/admin/promotions/:id` | Update promotion |
| `DELETE` | `/api/admin/promotions/:id` | Delete promotion |
| `GET` | `/api/admin/coupons` | List coupons |
| `POST` | `/api/admin/coupons` | Create coupon |
| `PUT` | `/api/admin/coupons/:id` | Update coupon |
| `DELETE` | `/api/admin/coupons/:id` | Delete coupon |

---

## Database

Schema is applied automatically on startup via `migrate()`. To apply manually:

```bash
mysql -u root -p < src/db/schema.sql
```

### Tables

| Table | Description |
|---|---|
| `users` | Accounts with role `customer` or `admin` |
| `categories` | Product categories with a unique slug |
| `products` | Catalog with soft delete (`active`) and unique name constraint |
| `cart_items` | Per-user cart; unique on `(user_id, product_id)` |
| `wishlists` | Same structure as cart without quantity |
| `orders` | Order header: status, total, shipping info, payment method |
| `order_items` | Line items with `unit_price` captured at purchase time |
| `password_resets` | Tokens for password reset flow |
| `promotions` | Time-bounded percentage discounts |
| `promotion_products` | M2M join between promotions and products |
| `coupons` | Single-use discount codes with expiry and usage tracking |

### Seed data

`schema.sql` seeds 4 categories and 20 products (5 per category: Women, Men, Accessories, New Arrivals). All products include an `image_url` pointing to Unsplash. `INSERT IGNORE` ensures re-runs never duplicate data.

---

## Conventions

- **No ORM.** All queries use `pool.execute()` with `?` placeholders — no string interpolation.
- **Controllers are thin.** They extract params from `req`, call a service function, and return `res.json()`. No SQL in controllers.
- **Error responses** always use `{ error: string }` with the appropriate HTTP status code.
- **No `any`.** TypeScript strict mode is enabled. Use `unknown` with type narrowing where needed.
