# VELN — Frontend

SvelteKit 2 application with UnoCSS, TypeScript, and Svelte transitions.

---

## Stack

- **Framework:** SvelteKit 2
- **Language:** TypeScript (strict mode)
- **Styles:** UnoCSS — `preset-wind` + `preset-attributify`
- **Animations:** Svelte built-in `transition:` and `animate:` directives
- **Build tool:** Vite 6

---

## Getting started

```bash
# .env is already in the repo with PUBLIC_API_URL pointing to localhost:3001
npm install
npm run dev   # http://localhost:5173
```

Make sure the backend is running on port 3001 before starting the frontend.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | `svelte-check` — type-checks `.svelte` and `.ts` files |
| `npm run lint` | ESLint over `src/` |

---

## Environment variables

| Variable | Description |
|---|---|
| `PUBLIC_API_URL` | Backend base URL. Default: `http://localhost:3001` |

---

## Project structure

```
src/
├── app.html              # HTML shell
├── app.d.ts              # App namespace augmentations
├── lib/
│   ├── api/              # fetch wrappers — one file per domain
│   │   ├── client.ts     # Base apiFetch<T>() — injects Bearer token automatically
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   ├── wishlist.ts
│   │   └── admin.ts
│   ├── stores/
│   │   ├── auth.store.ts      # JWT + user, persisted to localStorage
│   │   ├── cart.store.ts      # Cart items, persisted to localStorage
│   │   ├── wishlist.store.ts  # Product ID set, persisted to localStorage
│   │   └── toast.store.ts     # Toast queue with auto-dismiss
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.svelte
│   │   ├── product/
│   │   │   ├── ProductCard.svelte
│   │   │   ├── ProductGrid.svelte
│   │   │   ├── ProductBadge.svelte
│   │   │   └── CategoryFilter.svelte
│   │   ├── cart/
│   │   │   ├── CartDrawer.svelte   # Slide-in drawer (fly from right, 300ms)
│   │   │   └── CartItem.svelte
│   │   ├── checkout/
│   │   │   ├── ShippingForm.svelte
│   │   │   └── PaymentSelector.svelte
│   │   ├── orders/
│   │   │   ├── OrderCard.svelte
│   │   │   └── StatusTimeline.svelte
│   │   ├── admin/
│   │   │   ├── ProductForm.svelte
│   │   │   └── StockEditor.svelte
│   │   └── ui/
│   │       ├── Modal.svelte
│   │       ├── Toast.svelte
│   │       ├── ToastContainer.svelte
│   │       ├── Skeleton.svelte
│   │       └── EmptyState.svelte
│   └── types/
│       ├── auth.ts
│       ├── product.ts
│       ├── cart.ts
│       └── order.ts
└── routes/
    ├── +layout.svelte         # Root layout: Navbar, CartDrawer, ToastContainer, page fade
    ├── +layout.ts             # prerender = false
    ├── +page.svelte           # Home — product grid with category filter
    ├── +error.svelte          # Global error page
    ├── product/[id]/
    │   └── +page.svelte       # Product detail — add to cart, wishlist toggle
    ├── cart/
    │   └── +page.svelte       # Full cart page
    ├── checkout/
    │   └── +page.svelte       # Shipping form + simulated payment
    ├── orders/
    │   ├── +page.svelte       # Order history
    │   └── [id]/
    │       └── +page.svelte   # Order detail with status timeline
    ├── auth/
    │   ├── login/+page.svelte
    │   └── register/+page.svelte
    └── admin/
        ├── +layout.svelte     # Auth guard (admin only) + sidebar nav
        ├── +page.svelte       # Redirect to /admin/products
        ├── products/+page.svelte
        ├── orders/+page.svelte
        └── inventory/+page.svelte
```

---

## Stores

### `auth.store.ts`

Writable store backed by `localStorage`. Exports `authStore`, `login(token, user)`, `logout()`, `isAdmin` (derived), `isLoggedIn` (derived). On app load the store is populated from `localStorage`; protected pages use the store to guard navigation.

### `cart.store.ts`

Writable store backed by `localStorage`. Exports `cartStore`, `cartCount` (derived), `cartTotal` (derived), `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`.

### `wishlist.store.ts`

`Set<number>` of product IDs backed by `localStorage`. When the user is logged in, mutations are synced to the backend. `toggleWishlist(id)` adds or removes; `syncWishlist()` fetches the server state after login.

### `toast.store.ts`

Array of `{ id, message, type, duration }`. `addToast(msg, type?, duration?)` appends and auto-removes after `duration` ms (default 3 s). `removeToast(id)` dismisses immediately.

---

## UnoCSS configuration

Defined in `uno.config.ts`:

```ts
theme: {
  colors: {
    brand: '#111111',   // near-black for text and primary actions
    accent: '#C9A84C',  // gold for highlights and new-arrival badges
  },
}

shortcuts: {
  'btn-primary': 'bg-brand text-white px-6 py-3 ...',
  'btn-outline': 'border border-brand text-brand px-6 py-3 ...',
  'card':        'bg-white rounded-lg shadow-sm overflow-hidden',
}
```

---

## Animations

| Element | Transition |
|---|---|
| Page changes | `fade` — 200ms in / 100ms out — applied via `{#key $page.url.pathname}` in the root layout |
| Cart drawer | `fly` from `x: 400`, 300ms — backdrop uses `fade` 150ms |
| Product cards | `fly` from `y: 40`, 300ms, with `delay: index * 80ms` for stagger |
| Toast messages | `fly` from `y: -16`, 200ms in — `fade` 150ms out |
| Success banner on order detail | `fly` from `y: -20`, 400ms |

---

## API client

`src/lib/api/client.ts` exports `apiFetch<T>(path, options?)`:

- Reads `PUBLIC_API_URL` from `$env/static/public`.
- Automatically injects `Authorization: Bearer <token>` from the auth store when the user is logged in.
- Skips `Content-Type: application/json` for `FormData` bodies (lets the browser set the multipart boundary).
- Throws `ApiError(status, message)` on non-2xx responses — all callers use `instanceof ApiError` to show user-facing error messages.

---

## Conventions

- Every `{#await}` block has a `{:catch error}` branch — no silent failures.
- Stores are the single source of truth; components never call the API directly.
- TypeScript strict mode. No `any`.
