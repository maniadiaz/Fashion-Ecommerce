# VELN — Fashion Ecommerce

Portfolio project. Full-stack fashion store with a minimal luxury aesthetic.

> Payments are fully simulated — no real gateway is integrated.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript · Vite 8 · Material UI v9 · Zustand v5 · React Router v7 |
| Backend | Node.js 20 · Express 5 · TypeScript · tsx |
| Database | MySQL 8 · raw SQL (no ORM) · mysql2 |
| Auth | JWT · bcryptjs |
| Validation | Zod 4 |
| File uploads | Multer |
| CI/CD | GitHub Actions |

---

## Project structure

```
Fashion-Ecommerce/
├── .github/
│   └── workflows/
│       ├── ci.yml                # Lint + typecheck + build on every PR
│       ├── backend-tests.yml     # Triggered on backend/** changes
│       ├── frontend-tests.yml    # Triggered on frontend/** changes
│       └── deploy-preview.yml    # Placeholder for future preview deploys
├── frontend/                     # React + Vite app  →  see frontend/README.md
├── backend/                      # Express API        →  see backend/README.md
```

---

## Quick start

### Prerequisites

- Node.js 20+
- MySQL 8+
- npm 9+

### 1 — Database

```bash
mysql -u root -p < backend/src/db/schema.sql
```

Creates the `veln_db` database, all tables, and seeds categories + 20 products (5 per category).
Safe to re-run — uses `CREATE TABLE IF NOT EXISTS` and `INSERT IGNORE`.

### 2 — Backend

```bash
cd backend
cp .env.example .env   # fill in DB credentials and JWT_SECRET
npm install
npm run dev            # starts on http://localhost:3001
```

On first start `migrate()` runs automatically: applies the schema, deduplicates any legacy seed rows, and verifies product category assignments.

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev            # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:3001`.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | **Yes** | — | Random 32+ char string. Run `openssl rand -hex 32`. |
| `DB_USER` | **Yes** | — | MySQL username |
| `DB_PASSWORD` | No | `""` | MySQL password (empty string accepted for local dev) |
| `DB_HOST` | No | `localhost` | MySQL host |
| `DB_PORT` | No | `3306` | MySQL port |
| `DB_NAME` | No | `veln_db` | Database name |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime |
| `PORT` | No | `3001` | HTTP port |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS allowed origin |
| `UPLOAD_DIR` | No | `./uploads` | Directory for uploaded product images |

`JWT_SECRET` and `DB_USER` are validated at startup — the process exits immediately with a clear error if either is missing.

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | *(proxied via Vite)* | Not needed in dev — the proxy handles it |

---

## Features

- Browse 20 products across 4 categories (Women, Men, Accessories, New Arrivals)
- Category filter bar with URL-synced query params (`?category=slug`)
- Product detail page with stock indicator, Add to Cart, and wishlist toggle
- Cart drawer — quantity controls, remove item, subtotal, checkout CTA
- Simulated checkout: shipping form + decorative payment fields (card / transfer / cash)
- Order history with status timeline (Pending → Processing → Shipped → Delivered)
- Admin panel: product CRUD with image upload, order status management, inventory control, promotions, coupons
- JWT auth: register, login, protected routes, admin guard
- Route-change progress bar (NProgress) + page-level skeleton loaders
- Persistent state: cart, wishlist, and auth token stored in `localStorage` via Zustand `persist`

---

## Admin account

There is no admin signup flow. Create one directly after running the schema:

```sql
-- Option 1: insert directly (password must be bcrypt-hashed)
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@veln.com', '<bcrypt-hash>', 'admin');

-- Option 2: register normally through the UI, then promote
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## CI/CD

| Workflow | Trigger | Checks |
|---|---|---|
| `ci.yml` | Push / PR to `main` | Backend: lint + typecheck · Frontend: typecheck + build |
| `backend-tests.yml` | Changes in `backend/**` | Same as CI backend job |
| `frontend-tests.yml` | Changes in `frontend/**` | Same as CI frontend job |
| `deploy-preview.yml` | Pull request | Placeholder — reserved for Vercel / Netlify |
