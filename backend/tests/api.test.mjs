/**
 * VELN Backend — Integration tests against the live server (http://localhost:3001)
 * Run: node tests/api.test.mjs
 *
 * Requires: backend running on :3001, MySQL populated with seed data
 */

const BASE = 'http://localhost:3001/api'

// ─── Helpers ─────────────────────────────────────────────────────────────────

let passed = 0
let failed = 0
const failures = []

async function req(method, path, { body, token, form } = {}) {
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  let bodyPayload
  if (form) {
    bodyPayload = form
  } else if (body) {
    headers['Content-Type'] = 'application/json'
    bodyPayload = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, { method, headers, body: bodyPayload })
  let data
  try { data = await res.json() } catch { data = null }
  return { status: res.status, data }
}

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`)
    passed++
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`)
    failed++
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`)
  }
}

function section(name) {
  console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 50 - name.length))}`)
}

// ─── State shared across tests ────────────────────────────────────────────────

let customerToken = ''
let adminToken = ''
let createdProductId = 0
let createdOrderId = 0
let firstProductId = 0
let firstCategoryId = 0
let createdPromotionId = 0
let createdCouponId = 0

const CUSTOMER_EMAIL = `test_${Date.now()}@veln.com`
const CUSTOMER_PASS = 'TestPass123!'

// ─── Tests ───────────────────────────────────────────────────────────────────

async function testHealth() {
  section('Health')
  const { status, data } = await req('GET', '/health')
  assert('GET /health → 200', status === 200)
  assert('returns { status: ok }', data?.status === 'ok')
}

async function testAuth() {
  section('Auth — Register / Login / Me')

  // Register — returns { user } (no token on register, login is separate)
  const reg = await req('POST', '/auth/register', {
    body: { name: 'Test User', email: CUSTOMER_EMAIL, password: CUSTOMER_PASS },
  })
  assert('POST /auth/register → 201', reg.status === 201, `got ${reg.status}`)
  assert('register returns user object', typeof reg.data?.user?.id === 'number', `got ${JSON.stringify(reg.data)}`)

  // Duplicate register
  const dup = await req('POST', '/auth/register', {
    body: { name: 'Test User', email: CUSTOMER_EMAIL, password: CUSTOMER_PASS },
  })
  assert('duplicate register → 409', dup.status === 409, `got ${dup.status}`)

  // Login wrong password
  const badLogin = await req('POST', '/auth/login', {
    body: { email: CUSTOMER_EMAIL, password: 'wrong' },
  })
  assert('login wrong password → 401', badLogin.status === 401, `got ${badLogin.status}`)

  // Login correct — returns { token, user }
  const login = await req('POST', '/auth/login', {
    body: { email: CUSTOMER_EMAIL, password: CUSTOMER_PASS },
  })
  assert('POST /auth/login → 200', login.status === 200, `got ${login.status}`)
  assert('login returns token', typeof login.data?.token === 'string')
  customerToken = login.data?.token ?? ''

  // Me — no token
  const meUnauth = await req('GET', '/auth/me')
  assert('GET /auth/me without token → 401', meUnauth.status === 401, `got ${meUnauth.status}`)

  // Me — valid token
  const me = await req('GET', '/auth/me', { token: customerToken })
  assert('GET /auth/me → 200', me.status === 200, `got ${me.status}`)
  assert('me returns email', me.data?.user?.email === CUSTOMER_EMAIL, `got ${me.data?.user?.email}`)

  // Admin login
  const adminLogin = await req('POST', '/auth/login', {
    body: { email: 'admin@veln.com', password: 'Admin1234!' },
  })
  assert('admin login → 200', adminLogin.status === 200, `got ${adminLogin.status}`)
  assert('admin token received', typeof adminLogin.data?.token === 'string')
  adminToken = adminLogin.data?.token ?? ''
}

async function testCategories() {
  section('Categories')
  const { status, data } = await req('GET', '/categories')
  assert('GET /categories → 200', status === 200, `got ${status}`)
  assert('returns { categories: [] }', Array.isArray(data?.categories), `got ${JSON.stringify(data)}`)
  assert('has at least 1 category', data?.categories?.length >= 1)
  firstCategoryId = data?.categories?.[0]?.id ?? 0
  assert('category has id, name, slug', data?.categories?.[0]?.slug !== undefined)
}

async function testProducts() {
  section('Products — Public read')

  const list = await req('GET', '/products')
  assert('GET /products → 200', list.status === 200, `got ${list.status}`)
  assert('returns { products: [] }', Array.isArray(list.data?.products))
  assert('has products', list.data?.products?.length >= 1)
  firstProductId = list.data?.products?.[0]?.id ?? 0

  // Filter by category
  const filtered = await req('GET', '/products?category=men')
  assert('GET /products?category=men → 200', filtered.status === 200)
  assert('all filtered products have category_slug=men',
    filtered.data?.products?.every((p) => p.category_slug === 'men'),
    `got slugs: ${filtered.data?.products?.map(p => p.category_slug).join(',')}`)

  // Invalid category returns empty
  const none = await req('GET', '/products?category=nonexistent')
  assert('GET /products?category=nonexistent → 200 empty', none.status === 200 && none.data?.products?.length === 0)

  // Detail
  const detail = await req('GET', `/products/${firstProductId}`)
  assert(`GET /products/${firstProductId} → 200`, detail.status === 200, `got ${detail.status}`)
  assert('detail returns { product }', detail.data?.product?.id === firstProductId)
  assert('detail has price', detail.data?.product?.price !== undefined)

  // Non-existent product
  const notFound = await req('GET', '/products/999999')
  assert('GET /products/999999 → 404', notFound.status === 404, `got ${notFound.status}`)
}

async function testProductsCRUD() {
  section('Products — Admin CRUD')

  // Customer cannot create
  const unauth = await req('POST', '/products', {
    token: customerToken,
    body: { name: 'X', description: 'X', price: 10, stock: 1, category_id: firstCategoryId },
  })
  assert('POST /products as customer → 403', unauth.status === 403, `got ${unauth.status}`)

  // Create as admin (multipart)
  const form = new FormData()
  form.append('name', `Test Product ${Date.now()}`)
  form.append('description', 'Integration test product')
  form.append('price', '99.99')
  form.append('stock', '10')
  form.append('category_id', String(firstCategoryId))
  form.append('badge', 'new')

  const created = await req('POST', '/products', { token: adminToken, form })
  assert('POST /products as admin → 201', created.status === 201, `got ${created.status}: ${JSON.stringify(created.data)}`)
  assert('created product has id', typeof created.data?.product?.id === 'number')
  createdProductId = created.data?.product?.id ?? 0

  // Update
  const updated = await req('PUT', `/products/${createdProductId}`, {
    token: adminToken,
    body: { price: 149.99, stock: 5 },
  })
  assert(`PUT /products/${createdProductId} → 200`, updated.status === 200, `got ${updated.status}`)
  assert('price updated', Number(updated.data?.product?.price) === 149.99)

  // Soft delete — backend returns 204 No Content
  const deleted = await req('DELETE', `/products/${createdProductId}`, { token: adminToken })
  assert(`DELETE /products/${createdProductId} → 204`, deleted.status === 204, `got ${deleted.status}`)

  // Confirm soft-deleted product is gone from public list
  const afterDelete = await req('GET', `/products/${createdProductId}`)
  assert('soft-deleted product → 404 from public', afterDelete.status === 404)
}

async function testCart() {
  section('Cart')

  // List without token
  const unauth = await req('GET', '/cart')
  assert('GET /cart without token → 401', unauth.status === 401)

  // List empty cart — returns { items: [] }
  const empty = await req('GET', '/cart', { token: customerToken })
  assert('GET /cart empty → 200', empty.status === 200, `got ${empty.status}`)
  assert('empty cart has items array', Array.isArray(empty.data?.items))

  // Add item — cart upserts and returns { items } with 200
  const add = await req('POST', '/cart', {
    token: customerToken,
    body: { productId: firstProductId, quantity: 2 },
  })
  assert('POST /cart add item → 200', add.status === 200, `got ${add.status}`)
  assert('cart returns items after add', Array.isArray(add.data?.items))

  // Add same item again — upserts (200)
  const addAgain = await req('POST', '/cart', {
    token: customerToken,
    body: { productId: firstProductId, quantity: 1 },
  })
  assert('POST /cart same item upserts → 200', addAgain.status === 200, `got ${addAgain.status}`)

  // List with items
  const withItems = await req('GET', '/cart', { token: customerToken })
  assert('cart has items after add', withItems.data?.items?.length >= 1)

  // Update quantity — returns { items }
  const upd = await req('PUT', `/cart/${firstProductId}`, {
    token: customerToken,
    body: { quantity: 3 },
  })
  assert(`PUT /cart/${firstProductId} → 200`, upd.status === 200, `got ${upd.status}`)

  // Remove item — 204 No Content
  const rem = await req('DELETE', `/cart/${firstProductId}`, { token: customerToken })
  assert(`DELETE /cart/${firstProductId} → 204`, rem.status === 204, `got ${rem.status}`)

  // Add again for order test
  await req('POST', '/cart', { token: customerToken, body: { productId: firstProductId, quantity: 1 } })

  // Clear — 204 No Content
  const cleared = await req('DELETE', '/cart', { token: customerToken })
  assert('DELETE /cart (clear) → 204', cleared.status === 204, `got ${cleared.status}`)

  // Confirm cleared
  const afterClear = await req('GET', '/cart', { token: customerToken })
  assert('cart empty after clear', afterClear.data?.items?.length === 0)
}

async function testOrders() {
  section('Orders')

  // Add product to cart first
  await req('POST', '/cart', { token: customerToken, body: { productId: firstProductId, quantity: 1 } })

  // Create order
  const order = await req('POST', '/orders', {
    token: customerToken,
    body: {
      shipping_name: 'Test User',
      shipping_address: '123 Test St, Test City',
      payment_method: 'card',
    },
  })
  assert('POST /orders → 201', order.status === 201, `got ${order.status}: ${JSON.stringify(order.data)}`)
  assert('order has id', typeof order.data?.order?.id === 'number')
  createdOrderId = order.data?.order?.id ?? 0

  // Cart should be cleared after order
  const cartAfter = await req('GET', '/cart', { token: customerToken })
  assert('cart cleared after order', cartAfter.data?.items?.length === 0)

  // List orders — returns { orders: [] }
  const list = await req('GET', '/orders', { token: customerToken })
  assert('GET /orders → 200', list.status === 200, `got ${list.status}`)
  assert('returns { orders: [] }', Array.isArray(list.data?.orders))
  assert('has the created order', list.data?.orders?.some(o => o.id === createdOrderId))

  // Order detail — returns { order: { ...items } }
  const detail = await req('GET', `/orders/${createdOrderId}`, { token: customerToken })
  assert(`GET /orders/${createdOrderId} → 200`, detail.status === 200, `got ${detail.status}`)
  assert('order has items array', Array.isArray(detail.data?.order?.items))
  assert('order items not empty', detail.data?.order?.items?.length >= 1)

  // Admin user cannot see customer's order via customer endpoint → 404
  const adminOrder = await req('GET', `/orders/${createdOrderId}`, { token: adminToken })
  assert('different user cannot see order → 404', adminOrder.status === 404, `got ${adminOrder.status}`)

  // Create order with empty cart → 400
  const empty = await req('POST', '/orders', {
    token: customerToken,
    body: { shipping_name: 'X', shipping_address: 'Y Blvd 123', payment_method: 'cash' },
  })
  assert('POST /orders with empty cart → 400', empty.status === 400, `got ${empty.status}`)
}

async function testWishlist() {
  section('Wishlist')

  // Without token
  const unauth = await req('GET', '/wishlist')
  assert('GET /wishlist without token → 401', unauth.status === 401)

  // Get — returns { productIds: number[] }
  const empty = await req('GET', '/wishlist', { token: customerToken })
  assert('GET /wishlist → 200', empty.status === 200, `got ${empty.status}`)
  assert('wishlist returns productIds array', Array.isArray(empty.data?.productIds), `got ${JSON.stringify(empty.data)}`)

  // Toggle add
  const add = await req('POST', `/wishlist/${firstProductId}`, { token: customerToken })
  assert(`POST /wishlist/${firstProductId} (add) → 200`, add.status === 200, `got ${add.status}`)

  // Confirm in list
  const withItem = await req('GET', '/wishlist', { token: customerToken })
  assert('wishlist has product after toggle', withItem.data?.productIds?.includes(firstProductId), `got ${JSON.stringify(withItem.data?.productIds)}`)

  // Toggle remove
  const remove = await req('POST', `/wishlist/${firstProductId}`, { token: customerToken })
  assert(`POST /wishlist/${firstProductId} (remove) → 200`, remove.status === 200, `got ${remove.status}`)

  // Confirm removed
  const afterRemove = await req('GET', '/wishlist', { token: customerToken })
  assert('wishlist empty after second toggle', !afterRemove.data?.productIds?.includes(firstProductId))
}

async function testAdminOrders() {
  section('Admin — Orders')

  // Requires admin
  const unauth = await req('GET', '/admin/orders', { token: customerToken })
  assert('GET /admin/orders as customer → 403', unauth.status === 403, `got ${unauth.status}`)

  const list = await req('GET', '/admin/orders', { token: adminToken })
  assert('GET /admin/orders → 200', list.status === 200, `got ${list.status}`)
  assert('returns orders array', Array.isArray(list.data?.orders))

  // Update order status
  const upd = await req('PUT', `/admin/orders/${createdOrderId}`, {
    token: adminToken,
    body: { status: 'processing' },
  })
  assert(`PUT /admin/orders/${createdOrderId} → 200`, upd.status === 200, `got ${upd.status}: ${JSON.stringify(upd.data)}`)

  // Invalid status → 400
  const bad = await req('PUT', `/admin/orders/${createdOrderId}`, {
    token: adminToken,
    body: { status: 'invalid_status' },
  })
  assert('PUT /admin/orders with invalid status → 400', bad.status === 400, `got ${bad.status}`)
}

async function testAdminInventory() {
  section('Admin — Inventory')

  // Returns { inventory: [...] }
  const list = await req('GET', '/admin/inventory', { token: adminToken })
  assert('GET /admin/inventory → 200', list.status === 200, `got ${list.status}`)
  assert('returns inventory array', Array.isArray(list.data?.inventory), `got keys: ${Object.keys(list.data ?? {})}`)
  assert('inventory items have stock field', list.data?.inventory?.[0]?.stock !== undefined)

  const upd = await req('PUT', `/admin/inventory/${firstProductId}`, {
    token: adminToken,
    body: { stock: 99 },
  })
  assert(`PUT /admin/inventory/${firstProductId} → 200`, upd.status === 200, `got ${upd.status}`)

  // Verify stock updated via product detail
  const detail = await req('GET', `/products/${firstProductId}`)
  assert('stock reflected in product detail', Number(detail.data?.product?.stock) === 99)
}

async function testAdminPromotions() {
  section('Admin — Promotions CRUD')

  const now = new Date()
  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  // Schema accepts ISO 8601 with T separator: "YYYY-MM-DDTHH:MM"
  const toISO = d => d.toISOString().slice(0, 16)

  // Create
  const created = await req('POST', '/admin/promotions', {
    token: adminToken,
    body: {
      name: 'Test Promo',
      description: 'Integration test promotion',
      discount_pct: 15,
      starts_at: toISO(now),
      ends_at: toISO(future),
    },
  })
  assert('POST /admin/promotions → 201', created.status === 201, `got ${created.status}: ${JSON.stringify(created.data)}`)
  createdPromotionId = created.data?.promotion?.id ?? 0
  assert('promotion has id', createdPromotionId > 0)

  // List
  const list = await req('GET', '/admin/promotions', { token: adminToken })
  assert('GET /admin/promotions → 200', list.status === 200)
  assert('has the created promotion', list.data?.promotions?.some(p => p.id === createdPromotionId))

  // Update
  const upd = await req('PUT', `/admin/promotions/${createdPromotionId}`, {
    token: adminToken,
    body: { discount_pct: 20, active: true },
  })
  assert(`PUT /admin/promotions/${createdPromotionId} → 200`, upd.status === 200, `got ${upd.status}`)

  // Associate product
  const assoc = await req('POST', `/admin/promotions/${createdPromotionId}/products`, {
    token: adminToken,
    body: { product_id: firstProductId },
  })
  assert('POST /admin/promotions/:id/products → 201', assoc.status === 201, `got ${assoc.status}: ${JSON.stringify(assoc.data)}`)

  // List promotion-products
  const pp = await req('GET', '/admin/promotion-products', { token: adminToken })
  assert('GET /admin/promotion-products → 200', pp.status === 200)

  // Remove product from promotion
  const remAssoc = await req('DELETE', `/admin/promotions/${createdPromotionId}/products/${firstProductId}`, { token: adminToken })
  assert('DELETE promo-product → 200/204', [200, 204].includes(remAssoc.status), `got ${remAssoc.status}`)

  // Delete promotion
  const del = await req('DELETE', `/admin/promotions/${createdPromotionId}`, { token: adminToken })
  assert(`DELETE /admin/promotions/${createdPromotionId} → 200/204`, [200, 204].includes(del.status), `got ${del.status}`)
}

async function testAdminCoupons() {
  section('Admin — Coupons CRUD')

  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const toISO = d => d.toISOString().slice(0, 16)
  const couponCode = `TEST${Date.now()}`

  // Create — schema: code (alphanumeric), discount_pct, max_uses, expires_at
  const created = await req('POST', '/admin/coupons', {
    token: adminToken,
    body: {
      code: couponCode,
      discount_pct: 10,
      max_uses: 5,
      expires_at: toISO(expires),
    },
  })
  assert('POST /admin/coupons → 201', created.status === 201, `got ${created.status}: ${JSON.stringify(created.data)}`)
  createdCouponId = created.data?.coupon?.id ?? 0
  assert('coupon has id', createdCouponId > 0)

  // List
  const list = await req('GET', '/admin/coupons', { token: adminToken })
  assert('GET /admin/coupons → 200', list.status === 200)
  assert('has the created coupon', list.data?.coupons?.some(c => c.id === createdCouponId))

  // Duplicate code → 409
  const dup = await req('POST', '/admin/coupons', {
    token: adminToken,
    body: { code: couponCode, discount_pct: 5, max_uses: 1, expires_at: toISO(expires) },
  })
  assert('duplicate coupon code → 409', dup.status === 409, `got ${dup.status}`)

  // Update
  const upd = await req('PUT', `/admin/coupons/${createdCouponId}`, {
    token: adminToken,
    body: { discount_pct: 25 },
  })
  assert(`PUT /admin/coupons/${createdCouponId} → 200`, upd.status === 200, `got ${upd.status}`)

  // Delete
  const del = await req('DELETE', `/admin/coupons/${createdCouponId}`, { token: adminToken })
  assert(`DELETE /admin/coupons/${createdCouponId} → 200/204`, [200, 204].includes(del.status), `got ${del.status}`)
}

// ─── Runner ──────────────────────────────────────────────────────────────────

async function run() {
  console.log('VELN API Integration Tests')
  console.log('==========================')
  console.log(`Target: ${BASE}`)
  console.log()

  try {
    await testHealth()
    await testAuth()
    await testCategories()
    await testProducts()
    await testProductsCRUD()
    await testCart()
    await testOrders()
    await testWishlist()
    await testAdminOrders()
    await testAdminInventory()
    await testAdminPromotions()
    await testAdminCoupons()
  } catch (err) {
    console.error('\nFATAL ERROR:', err.message)
    failed++
  }

  console.log('\n══════════════════════════════════════')
  console.log(`Results: ${passed} passed, ${failed} failed`)
  if (failures.length) {
    console.log('\nFailed tests:')
    failures.forEach(f => console.log(`  ✗ ${f}`))
  }
  console.log()

  if (failed > 0) process.exit(1)
}

run()
