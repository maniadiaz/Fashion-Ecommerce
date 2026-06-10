import { createConnection } from 'mysql2/promise'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { env } from '../config/env'

function resolveSchema(): string {
  // __dirname is src/db/ when running with tsx (dev / pm2 dev)
  // and dist/db/ when running compiled output.
  // Fall back to the source path relative to cwd so compiled
  // builds work without copying the file to dist/.
  const candidates = [
    resolve(__dirname, 'schema.sql'),
    resolve(process.cwd(), 'src/db/schema.sql'),
  ]
  const found = candidates.find(existsSync)
  if (!found) {
    throw new Error(
      `schema.sql not found. Tried:\n${candidates.map((p) => `  ${p}`).join('\n')}`
    )
  }
  return readFileSync(found, 'utf8')
}

export async function migrate(): Promise<void> {
  const conn = await createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true,
  })

  try {
    const sql = resolveSchema()
    await conn.query(sql)
    console.log('[db] Schema is up to date')

    // Add unique constraint on product name if not already present.
    // The IF NOT EXISTS syntax isn't available for ADD UNIQUE in MySQL 5.x/8.x,
    // so we ignore the duplicate-key error silently.
    try {
      await conn.query(
        `ALTER TABLE veln_db.products ADD UNIQUE KEY uq_product_name (name)`
      )
      console.log('[db] Added unique constraint on products.name')
    } catch {
      // Constraint already exists — safe to ignore
    }

    // Remove duplicate products: keep only the lowest-id row per name.
    // This cleans up rows inserted by seed.ts on previous restarts.
    await conn.query(`
      DELETE p FROM veln_db.products p
      INNER JOIN (
        SELECT name, MIN(id) AS keep_id
        FROM veln_db.products
        GROUP BY name
        HAVING COUNT(*) > 1
      ) dups ON p.name = dups.name AND p.id <> dups.keep_id
    `)
    console.log('[db] Duplicate products removed')

    // Seed images and correct categories for all canonical products.
    // image_url is only set if currently NULL so user uploads are never overwritten.
    const seedProducts: [string, string, string][] = [
      ['Oversized Linen Blazer',       'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80', 'women'],
      ['High-Waist Wide-Leg Trousers', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', 'women'],
      ['Silk Slip Dress',              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', 'women'],
      ['Cropped Cashmere Cardigan',    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80', 'women'],
      ['Tailored Wool Coat',           'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80', 'women'],
      ['Merino Crew-Neck Sweater',     'https://images.unsplash.com/photo-1614495800428-84885b5a39b9?w=600&q=80', 'men'],
      ['Slim-Fit Oxford Shirt',        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', 'men'],
      ['Relaxed Chino Trousers',       'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', 'men'],
      ['Technical Field Jacket',       'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', 'men'],
      ['Linen Blend Shorts',           'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&q=80', 'men'],
      ['Leather Card Holder',          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',   'accessories'],
      ['Minimalist Canvas Tote',       'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80', 'accessories'],
      ['Pebbled Leather Belt',         'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',   'accessories'],
      ['Merino Wool Scarf',            'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80', 'accessories'],
      ['Structured Weekend Bag',       'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80',   'accessories'],
      ['Asymmetric Silk Midi Dress',   'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', 'new-arrivals'],
      ['Structured Shoulder Bag',      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', 'new-arrivals'],
      ['Ribbed Knit Midi Skirt',       'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80', 'new-arrivals'],
      ['Suede Chelsea Boots',          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',   'new-arrivals'],
      ['Oversized Bomber Jacket',      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80',   'new-arrivals'],
    ]
    for (const [name, imageUrl, slug] of seedProducts) {
      await conn.query(
        `UPDATE veln_db.products p
         JOIN veln_db.categories c ON c.slug = ?
         SET p.category_id = c.id,
             p.image_url   = COALESCE(NULLIF(p.image_url, ''), ?)
         WHERE p.name = ?`,
        [slug, imageUrl, name]
      )
    }
    console.log('[db] Product images and categories verified')
  } finally {
    await conn.end()
  }
}
