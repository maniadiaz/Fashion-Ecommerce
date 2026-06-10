# VELN — Fashion Ecommerce

Portfolio project. Full-stack fashion store with a minimal, Apple-inspired aesthetic.

> Payments are fully simulated — no real gateway is integrated.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | SvelteKit 2 · TypeScript · UnoCSS |
| Backend | Node.js · Express 5 · TypeScript |
| Database | MySQL 8 · raw SQL (no ORM) |
| Auth | JWT · bcryptjs |
| Validation | Zod |
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
├── frontend/                     # SvelteKit app  →  see frontend/README.md
├── backend/                      # Express API    →  see backend/README.md
└── CLAUDE.md                     # Project spec and coding conventions
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

Creates the `veln_db` database, all tables, and seeds categories + sample products.
Safe to re-run — uses `CREATE TABLE IF NOT EXISTS` and `INSERT IGNORE`, so existing data is never overwritten.

### 2 — Backend

```bash
cd backend
cp .env.example .env   # fill in DB credentials and JWT_SECRET
npm install
npm run dev            # starts on http://localhost:3001
```

### 3 — Frontend

```bash
cd frontend
# .env is already included with PUBLIC_API_URL=http://localhost:3001
npm install
npm run dev            # starts on http://localhost:5173
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | **Yes** | Random 32+ char string. Run `openssl rand -hex 32`. |
| `DB_USER` | **Yes** | MySQL username |
| `DB_PASSWORD` | No | MySQL password (empty string allowed for local dev) |
| `DB_HOST` | No | Default: `localhost` |
| `DB_PORT` | No | Default: `3306` |
| `DB_NAME` | No | Default: `veln_db` |
| `JWT_EXPIRES_IN` | No | Default: `7d` |
| `PORT` | No | Default: `3001` |
| `FRONTEND_URL` | No | Default: `http://localhost:5173` |
| `UPLOAD_DIR` | No | Default: `./uploads` |

The server performs a **fail-fast validation** at startup. If a required variable is missing it prints a clear error and exits before opening the port.

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `PUBLIC_API_URL` | Backend base URL. Default: `http://localhost:3001` |

---

## Features

- Browse products with category filtering and badge labels (New, Sale, Limited)
- Product detail page with stock indicator and quantity selector
- Wishlist — persisted locally, synced to backend when logged in
- Cart drawer with fly animation + full cart page
- Simulated checkout: shipping form + decorative payment fields (card / transfer / cash)
- Order history with status timeline (Pending → Processing → Shipped → Delivered)
- Admin panel: product CRUD with image upload, order status management, inventory control
- JWT auth: register, login, protected routes
- Toast notifications, skeleton loaders, page transitions, global error page

---

## CI / CD

Four GitHub Actions workflows are maintained:

| Workflow | Trigger | What it checks |
|---|---|---|
| `ci.yml` | Push / PR to `main` | Lint + typecheck (backend) · Typecheck + build (frontend) |
| `backend-tests.yml` | Changes in `backend/**` | Same as CI backend job |
| `frontend-tests.yml` | Changes in `frontend/**` | Same as CI frontend job |
| `deploy-preview.yml` | Pull request | Placeholder — reserved for Vercel / Netlify |

---

## Admin account

There is no signup flow for admin accounts. Create one directly in the database after running the schema:

```sql
-- run inside mysql prompt after schema.sql has been applied
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@veln.com', '<bcrypt-hash>', 'admin');
```

Or register normally through the UI and then:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
