# VELN — Frontend

React 19 + Vite 8 SPA with Material UI v9, Zustand v5, and React Router v7.

---

## Stack

- **Framework:** React 19 + TypeScript 6
- **Build tool:** Vite 8
- **UI library:** Material UI v9 (`@mui/material`, `@mui/icons-material`)
- **Styling:** MUI `sx` prop + custom theme — no Tailwind, no CSS modules
- **State:** Zustand v5 with `persist` middleware (cart, wishlist, auth → `localStorage`)
- **Routing:** React Router v7 (`BrowserRouter`, file-style nested routes)
- **Progress:** NProgress for route-change bar

---

## Getting started

```bash
npm install
npm run dev    # Vite dev server on http://localhost:5173
```

The dev server proxies all `/api/*` requests to `http://localhost:3001` — no CORS config needed in dev.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + Vite production build → `dist/` |
| `npm run typecheck` | `tsc --noEmit` — used in CI |
| `npm run lint` | ESLint over `src/` |
| `npm run preview` | Serve the production build locally |

---

## Project structure

```
src/
├── api/
│   └── client.ts           # apiFetch<T> — wraps fetch, injects Bearer token, proxies /api
├── components/
│   ├── AuthDrawer.tsx       # Sign in / register drawer (right-side)
│   ├── CartDrawer.tsx       # Cart sidebar with quantity controls and checkout CTA
│   ├── CategoryBar.tsx      # Horizontal scrollable category filter pills
│   ├── Navbar.tsx           # Fixed top bar: logo · nav links · cart badge · auth button
│   ├── PageSkeleton.tsx     # Full-page skeleton loader (grid and detail variants)
│   ├── ProductCard.tsx      # Card with hover wishlist + Quick Add; category-aware fallback images
│   └── RouteProgress.tsx    # NProgress bar — fires on every location change
├── hooks/
│   └── useIntersectionObserver.ts  # Returns isVisible — used for scroll-triggered animations
├── pages/
│   ├── Home.tsx             # Landing: hero · products grid · featured banner · testimonials · newsletter
│   ├── Products.tsx         # Full catalog — URL-synced category filter (?category=slug)
│   ├── ProductDetail.tsx    # Product page — image · info · Add to Cart · wishlist
│   ├── Checkout.tsx         # Shipping form + simulated payment (card / transfer / cash)
│   ├── Orders.tsx           # Order history + detail with status timeline
│   └── admin/
│       ├── AdminLayout.tsx  # Sidebar nav + admin guard (redirects if not admin)
│       ├── AdminProducts.tsx    # Product CRUD with multipart image upload
│       ├── AdminOrders.tsx      # Order list with inline status selector
│       ├── AdminInventory.tsx   # Stock overview with inline quantity edit
│       ├── AdminPromotions.tsx  # Promotion CRUD with date range fields
│       └── AdminCoupons.tsx     # Coupon CRUD
├── store/
│   ├── authStore.ts         # user, token, isAdmin — persisted
│   ├── cartStore.ts         # items, totalItems, subtotal — persisted
│   ├── wishlistStore.ts     # items: number[] (product IDs) — persisted
│   └── uiStore.ts           # cartOpen, authOpen — not persisted
├── types/
│   └── index.ts             # Shared TypeScript interfaces (Product, CartItem, Order, …)
├── theme.ts                 # MUI custom theme — design tokens, global component overrides
├── App.tsx                  # BrowserRouter, all routes, ProtectedRoute, AdminRoute, AppShell
└── main.tsx                 # ThemeProvider + CssBaseline + StrictMode
```

---

## Routing

| Path | Auth | Component |
|---|---|---|
| `/` | — | `Home` |
| `/products` | — | `Products` — supports `?category=slug` |
| `/product/:id` | — | `ProductDetail` |
| `/checkout` | JWT | `Checkout` |
| `/orders` | JWT | `Orders` |
| `/orders/:id` | JWT | `Orders` (highlights order by id) |
| `/admin` | Admin | redirects to `/admin/products` |
| `/admin/products` | Admin | `AdminProducts` |
| `/admin/orders` | Admin | `AdminOrders` |
| `/admin/inventory` | Admin | `AdminInventory` |
| `/admin/promotions` | Admin | `AdminPromotions` |
| `/admin/coupons` | Admin | `AdminCoupons` |
| `*` | — | redirects to `/` |

`ProtectedRoute` reads `authStore.token` and redirects to `/` if absent.
`AdminLayout` reads `authStore.isAdmin` and redirects to `/` if false.

---

## Theme

Custom MUI theme defined in `src/theme.ts`:

| Token | Value |
|---|---|
| `background.default` | `#F8F7F5` (warm off-white) |
| `primary.main` | `#0A0A0A` (near-black) |
| `secondary.main` | `#E63323` (alert red) |
| `text.secondary` | `#6B6B6B` |
| Accent (inline) | `#C9A96E` (gold — used in Featured Banner) |
| Body font | Inter (300, 400, 500) |
| Display font | Playfair Display (400, 700) — h1–h3, logo |

All MUI components: `borderRadius: 0`, no box shadows, borders instead of elevation.

---

## State management

All stores use Zustand v5 with the `persist` middleware writing to `localStorage`.

| Store | Persisted | Contents |
|---|---|---|
| `authStore` | Yes | `user`, `token`, `isAdmin` |
| `cartStore` | Yes | `items[]`, `totalItems`, `subtotal` |
| `wishlistStore` | Yes | `items: number[]` (product IDs) |
| `uiStore` | No | `cartOpen`, `authOpen` |

---

## API client

`src/api/client.ts` exports a single `apiFetch<T>(path, options?)` function:

- Prepends `/api` to the path (routed to backend via Vite proxy in dev)
- Reads `authStore.getState().token` and injects `Authorization: Bearer <token>` when present
- Automatically removes `Content-Type` for `FormData` requests (lets the browser set the correct multipart boundary)
- Throws on non-2xx responses with the `{ error: string }` shape from the backend

---

## Image fallback strategy

`ProductCard` uses a two-tier image strategy:

1. **Primary:** `product.image_url` from the backend (Unsplash URL or `/uploads/...` path)
2. **Fallback on `onError`:** Category-aware pool — `women`, `men`, `accessories`, or `default` — indexed by grid position so the same product always gets the same fallback image

This means products always display a visually appropriate photo, even if the primary URL fails.
