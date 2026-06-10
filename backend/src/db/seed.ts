// env must be the first import so dotenv.config() runs before anything else reads process.env.
import { env } from '../config/env'

import { createConnection, RowDataPacket } from 'mysql2/promise'

interface SeedProduct {
  name: string
  description: string
  price: number
  stock: number
  badge: string
  category_slug: string
  image_url: string
}

const PRODUCTS: SeedProduct[] = [
  {
    name: 'Oversized Linen Blazer',
    description: 'Relaxed-fit blazer in breathable linen. Perfect for layering.',
    price: 189.00,
    stock: 15,
    badge: 'new arrival',
    category_slug: 'women',
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80',
  },
  {
    name: 'High-Waist Wide-Leg Trousers',
    description: 'Tailored wide-leg trousers with a clean, minimal silhouette.',
    price: 145.00,
    stock: 20,
    badge: 'bestseller',
    category_slug: 'women',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
  },
  {
    name: 'Merino Crew-Neck Sweater',
    description: 'Fine-gauge merino wool in a classic crew-neck cut.',
    price: 125.00,
    stock: 8,
    badge: 'essential',
    category_slug: 'men',
    image_url: 'https://images.unsplash.com/photo-1614495800428-84885b5a39b9?w=600&q=80',
  },
  {
    name: 'Slim-Fit Oxford Shirt',
    description: 'Crisp cotton Oxford shirt with a slim fit and button-down collar.',
    price: 95.00,
    stock: 30,
    badge: 'classic',
    category_slug: 'men',
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
  },
  {
    name: 'Leather Mini Crossbody',
    description: 'Compact crossbody bag in full-grain leather with an adjustable strap.',
    price: 210.00,
    stock: 10,
    badge: 'new arrival',
    category_slug: 'new-arrivals',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  },
]

interface CategoryRow extends RowDataPacket {
  id: number
}

interface ProductRow extends RowDataPacket {
  id: number
}

async function seed(): Promise<void> {
  const conn = await createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  })

  try {
    // Expand badge enum to include the marketing labels used below.
    // MODIFY COLUMN is idempotent — safe to run on an already-migrated column.
    await conn.execute(
      `ALTER TABLE products
       MODIFY COLUMN badge ENUM('new','sale','limited','new arrival','bestseller','essential','classic') NULL`
    )

    for (const p of PRODUCTS) {
      const [cats] = await conn.execute<CategoryRow[]>(
        'SELECT id FROM categories WHERE slug = ?',
        [p.category_slug]
      )
      if (!cats.length) {
        console.warn(`[seed] category not found: "${p.category_slug}" — skipping "${p.name}"`)
        continue
      }
      const categoryId = cats[0].id

      const [existing] = await conn.execute<ProductRow[]>(
        'SELECT id FROM products WHERE name = ?',
        [p.name]
      )

      if (existing.length > 0) {
        // Keep all user edits (price, stock, description) but refresh image + badge.
        await conn.execute(
          'UPDATE products SET image_url = ?, badge = ? WHERE name = ?',
          [p.image_url, p.badge, p.name]
        )
        console.log(`[seed] updated  "${p.name}"`)
      } else {
        await conn.execute(
          `INSERT INTO products (name, description, price, stock, badge, category_id, image_url, active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [p.name, p.description, p.price, p.stock, p.badge, categoryId, p.image_url]
        )
        console.log(`[seed] inserted "${p.name}"`)
      }
    }

    console.log('[seed] done')
  } finally {
    await conn.end()
  }
}

seed().catch((err: unknown) => {
  console.error('[seed] error:', err)
  process.exit(1)
})
