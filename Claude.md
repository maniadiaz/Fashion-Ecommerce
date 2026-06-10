# CLAUDE.md — VELN Ecommerce (Portfolio Project)

---

## ⚠️ CRITICAL RULES — Read before doing anything

### 1. Working Directory — NEVER leave this path

All file operations (create, edit, delete, move) must happen exclusively inside:

> C:\Users\Alexis Diaz\Documents\AlexisD\Trabajos\Nocompila\Alexis\Fashion-Ecommerce

- **Never** create files outside this directory
- **Never** run commands that affect paths above this root
- If a tool or command would write outside this path, stop and ask first
- Use relative paths from this root in all operations: `./frontend/`, `./backend/`

---

### 2. GitHub Actions Workflows — Required for every feature

Every feature branch must include or update a workflow in `.github/workflows/`.
This is not optional — it's part of the definition of done.

Workflows to maintain:

- `ci.yml` — Runs on every PR: lint + typecheck + build for both frontend and backend
- `backend-tests.yml` — Triggers only on changes inside `/backend/**`
- `frontend-tests.yml` — Triggers only on changes inside `/frontend/**`
- `deploy-preview.yml` — Reserved for future preview environment setup

The `ci.yml` runs two parallel jobs. The backend job checks out the repo, sets up Node 20 with npm cache, installs dependencies via `npm ci`, runs `tsc --noEmit` for typecheck, and runs eslint over the src folder. The frontend job does the same but runs `svelte-check` and `npm run build` instead of lint.

Rules:
- Both `package.json` files must have `typecheck` and `lint` scripts defined
- Every new route or middleware must pass typecheck before it's considered done
- When adding a new workflow, explain what it validates and why

---

### 3. Skills — Always use `.claude/skills/` before writing code

Before implementing any feature, read the relevant skill from `.claude/skills/`:

- `api-integration-specialist` — Use when building fetch wrappers or integrating APIs
- `brainstorming` — Use when planning a new feature or deciding between approaches
- `clean-code` — Apply to every file before considering it done
- `code-reviewer` — Run mentally before every commit
- `docker-expert` — Use when writing Dockerfiles or docker-compose
- `git-commit-helper` — Use before every commit to format the message correctly
- `react-best-practices` — Not applicable, we use SvelteKit
- `senior-architect` — Use when designing new modules, DB tables, or stores
- `senior-fullstack` — Apply to every feature end-to-end
- `senior-prompt-engineer` — Use if AI integration is added in the future
- `senior-security` — Mandatory on all code touching auth, JWT, passwords, or SQL queries
- `systematic-debugging` — Use when a bug is not obvious, follow the full process instead of guessing

---

## Project Overview

Fashion ecommerce portfolio project. Minimal Apple-style aesthetic.
**Goal:** Demonstrate full-stack skills with a modern, less-common stack.
Payments are **simulated only** (no real gateway).

---

## Tech Stack

### Frontend
- **SvelteKit** (v2+) with **TypeScript**
- **UnoCSS** with `@unocss/preset-wind` + `@unocss/preset-attributify`
- Transitions/animations via UnoCSS utilities + Svelte's built-in `transition:` and `animate:` directives
- No React, no Tailwind

### Backend
- **Node.js** + **Express** (TypeScript via `tsx`)
- **MySQL 8+** via `mysql2` (promise-based), no ORM — raw SQL only
- **JWT** for auth via `jsonwebtoken`
- **bcryptjs** for password hashing
- **Zod** for request validation
- **Multer** for image uploads stored in `/uploads`

---

## Project Structure

```
Fashion-Ecommerce/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── backend-tests.yml
│       ├── frontend-tests.yml
│       └── deploy-preview.yml
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api/           # fetch wrappers for backend calls
│   │   │   ├── stores/        # cart, auth, wishlist, toast
│   │   │   ├── components/    # reusable Svelte components
│   │   │   └── types/         # shared TypeScript interfaces
│   │   └── routes/
│   │       ├── +layout.svelte
│   │       ├── +page.svelte
│   │       ├── product/[id]/+page.svelte
│   │       ├── cart/+page.svelte
│   │       ├── checkout/+page.svelte
│   │       ├── orders/+page.svelte
│   │       ├── auth/login/+page.svelte
│   │       ├── auth/register/+page.svelte
│   │       └── admin/
│   │           ├── +layout.svelte
│   │           ├── products/+page.svelte
│   │           ├── orders/+page.svelte
│   │           └── inventory/+page.svelte
│   ├── uno.config.ts
│   ├── svelte.config.js
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts
│   │   │   └── schema.sql
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   ├── admin.ts
│   │   │   └── validate.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── products.routes.ts
│   │   │   ├── categories.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── orders.routes.ts
│   │   │   ├── wishlist.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── controllers/
│   │   ├── schemas/
│   │   └── index.ts
│   ├── uploads/
│   └── .env
└── CLAUDE.md
```

---

## Database Schema

Six tables: `users`, `categories`, `products`, `cart_items`, `wishlists`, `orders`, `order_items`.

- `users` — id, name, email (unique), password (hashed), role (customer | admin), created_at
- `categories` — id, name, slug (unique)
- `products` — id, name, description, price (decimal), stock, image_url, badge, category_id (FK), active (soft delete), created_at
- `cart_items` — id, user_id (FK), product_id (FK), quantity, added_at — unique constraint on (user_id, product_id)
- `wishlists` — same structure as cart_items without quantity
- `orders` — id, user_id (FK), status (pending | processing | shipped | delivered | cancelled), total, shipping_name, shipping_address, payment_method, payment_status (pending | paid | failed), created_at
- `order_items` — id, order_id (FK), product_id (FK), quantity, unit_price (recorded at purchase time)

Schema file lives at `backend/src/db/schema.sql`. Run it once to initialize the database.

---

## API Endpoints

### Auth
| Method | Endpoint           | Auth  | Description           |
|--------|--------------------|-------|-----------------------|
| POST   | /api/auth/register | No    | Register new user     |
| POST   | /api/auth/login    | No    | Login, returns JWT    |
| GET    | /api/auth/me       | JWT   | Get current user info |

### Products
| Method | Endpoint          | Auth  | Description                        |
|--------|-------------------|-------|------------------------------------|
| GET    | /api/products     | No    | List products (filter by category) |
| GET    | /api/products/:id | No    | Product detail                     |
| POST   | /api/products     | Admin | Create product (multipart/form)    |
| PUT    | /api/products/:id | Admin | Update product                     |
| DELETE | /api/products/:id | Admin | Soft delete (active = false)       |

### Cart
| Method | Endpoint             | Auth | Description           |
|--------|----------------------|------|-----------------------|
| GET    | /api/cart            | JWT  | Get cart items        |
| POST   | /api/cart            | JWT  | Add item              |
| PUT    | /api/cart/:productId | JWT  | Update quantity       |
| DELETE | /api/cart/:productId | JWT  | Remove item           |
| DELETE | /api/cart            | JWT  | Clear cart            |

### Orders
| Method | Endpoint        | Auth | Description            |
|--------|-----------------|------|------------------------|
| GET    | /api/orders     | JWT  | User's order history   |
| GET    | /api/orders/:id | JWT  | Order detail           |
| POST   | /api/orders     | JWT  | Create order from cart |

### Wishlist
| Method | Endpoint                 | Auth | Description          |
|--------|--------------------------|------|----------------------|
| GET    | /api/wishlist            | JWT  | Get wishlist         |
| POST   | /api/wishlist/:productId | JWT  | Toggle (add/remove)  |

### Admin
| Method | Endpoint                 | Auth  | Description          |
|--------|--------------------------|-------|----------------------|
| GET    | /api/admin/orders        | Admin | All orders           |
| PUT    | /api/admin/orders/:id    | Admin | Update order status  |
| GET    | /api/admin/inventory     | Admin | Stock overview       |
| PUT    | /api/admin/inventory/:id | Admin | Update stock         |

---

## Frontend Architecture

### Svelte Stores
- `cart.store.ts` — persisted in localStorage, manages items, quantities and totals
- `auth.store.ts` — JWT token and current user info
- `wishlist.store.ts` — set of product IDs
- `toast.store.ts` — global notification queue

### UnoCSS Setup
- Presets: `presetWind` (Tailwind-compatible utilities) + `presetAttributify` (attribute syntax)
- Custom colors: `brand` (near-black) and `accent` (gold) for the VELN aesthetic
- Custom font: Inter
- Shortcuts defined for `btn-primary`, `btn-outline`, and `card` to avoid repetition

### Svelte Transitions
- Cart drawer — `fly` from the right, 300ms
- Product cards — `fly` from below with 80ms staggered delay per card
- Page changes — `fade` at 200ms defined in the root layout

---

## Simulated Checkout Flow

1. User fills a shipping form with name, address and city
2. User selects a payment method: Credit Card, Bank Transfer, or Cash — all fake
3. If Credit Card is selected, show card number, expiry and CVV fields (decorative only)
4. On submit, POST to `/api/orders` creates the order with `payment_status: 'paid'`
5. Cart is cleared automatically, user is redirected to the order detail page with a success animation
6. No Stripe, no real gateway — fully simulated

---

## Environment Variables

### Backend `.env`
- PORT — 3001
- DB_HOST — localhost
- DB_PORT — 3306
- DB_USER — mysql username
- DB_PASSWORD — mysql password
- DB_NAME — veln_db
- JWT_SECRET — secure random string
- JWT_EXPIRES_IN — 7d
- FRONTEND_URL — http://localhost:5173
- UPLOAD_DIR — ./uploads

### Frontend `.env`
- PUBLIC_API_URL — http://localhost:3001

---

## Coding Conventions

### TypeScript
- Strict mode enabled in both frontend and backend
- Interfaces in `src/lib/types/` (frontend) and `src/types/` (backend)
- No `any` — use `unknown` and narrow where needed

### Backend
- Controllers are thin — business logic in service functions if complex
- All DB queries use parameterized statements (no string interpolation)
- Errors: always return `{ error: string }` with appropriate HTTP status
- Middleware order: `cors → json → routes → error handler`

### Frontend
- One component per file, PascalCase naming
- Stores handle all API calls via `src/lib/api/` fetch wrappers
- Loading states with Svelte's `{#await}` blocks
- Error boundaries per section, not global crash

### Git
- Commits in English, present tense: `add product filter by category`
- Branch per feature: `feat/cart-drawer`, `feat/admin-panel`

---

## Key Features to Implement (in order)

1. **Auth** — register, login, JWT guard, role middleware
2. **Product listing** — grid, category filter, badges, image
3. **Product detail** — gallery, add to cart, wishlist toggle
4. **Cart** — drawer + page, quantity controls, totals
5. **Checkout** — shipping form, simulated payment, order creation
6. **Order history** — list + detail with status timeline
7. **Admin panel** — product CRUD, order management, inventory
8. **Polish** — page transitions, skeleton loaders, toast notifications, empty states

---

## What NOT to implement (scope control)

- Real payment processing (Stripe/MercadoPago) — future feature
- Email notifications
- Product reviews/ratings
- Discount codes / coupons
- Multi-currency
- Search functionality (can be added as bonus)

---

## Running the Project

```bash
# Backend
cd backend
npm install
npm run dev       # tsx watch src/index.ts

# Frontend
cd frontend
npm install
npm run dev       # vite dev server on :5173

# Database
mysql -u root -p < backend/src/db/schema.sql
```

---

## Portfolio Notes

This project demonstrates:
- Full-stack TypeScript across frontend and backend
- SvelteKit (SSR-capable, file-based routing, stores)
- UnoCSS with custom design tokens and shortcuts
- RESTful API design with proper auth middleware
- MySQL relational schema with foreign keys
- GitHub Actions CI/CD experience (typecheck, lint, build per feature)
- Simulated e-commerce flow (not a toy, not overengineered)