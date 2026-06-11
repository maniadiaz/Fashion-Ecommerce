import { pool } from '../db/connection'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export interface Promotion {
  id: number
  name: string
  description: string | null
  discount_pct: number
  starts_at: string
  ends_at: string
  active: boolean
  created_at: string
}

export interface PromotionProduct {
  id: number
  promotion_id: number
  promotion_name: string
  discount_pct: number
  product_id: number
  product_name: string
  original_price: number
  discounted_price: number
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

interface PromotionRow extends RowDataPacket {
  id: number
  name: string
  description: string | null
  discount_pct: string
  starts_at: string
  ends_at: string
  active: number
  created_at: string
}

interface PromotionProductRow extends RowDataPacket {
  id: number
  promotion_id: number
  promotion_name: string
  discount_pct: string
  product_id: number
  product_name: string
  original_price: string
}

interface CountRow extends RowDataPacket {
  total: number
}

export async function listPromotions(page = 1, limit = 10): Promise<Paginated<Promotion>> {
  const offset = (page - 1) * limit

  const [[countRow]] = await pool.execute<CountRow[]>('SELECT COUNT(*) AS total FROM promotions')

  const [rows] = await pool.execute<PromotionRow[]>(
    `SELECT * FROM promotions ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
  )

  return {
    data: rows.map((r) => ({ ...r, discount_pct: parseFloat(r.discount_pct), active: r.active === 1 })),
    total: countRow.total,
    page,
    limit,
  }
}

export async function createPromotion(data: {
  name: string
  description?: string
  discount_pct: number
  starts_at: string
  ends_at: string
}): Promise<Promotion> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO promotions (name, description, discount_pct, starts_at, ends_at) VALUES (?, ?, ?, ?, ?)',
    [data.name, data.description ?? null, data.discount_pct, data.starts_at, data.ends_at]
  )
  const [rows] = await pool.execute<PromotionRow[]>('SELECT * FROM promotions WHERE id = ?', [result.insertId])
  const r = rows[0]
  return { ...r, discount_pct: parseFloat(r.discount_pct), active: r.active === 1 }
}

export async function updatePromotion(
  id: number,
  data: {
    name?: string
    description?: string
    discount_pct?: number
    starts_at?: string
    ends_at?: string
    active?: boolean
  }
): Promise<void> {
  const fields: string[] = []
  const values: unknown[] = []

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
  if (data.discount_pct !== undefined) { fields.push('discount_pct = ?'); values.push(data.discount_pct) }
  if (data.starts_at !== undefined) { fields.push('starts_at = ?'); values.push(data.starts_at) }
  if (data.ends_at !== undefined) { fields.push('ends_at = ?'); values.push(data.ends_at) }
  if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active ? 1 : 0) }

  if (fields.length === 0) return
  values.push(id)
  await pool.execute(`UPDATE promotions SET ${fields.join(', ')} WHERE id = ?`, values as (string | number | boolean | null)[])
}

export async function deletePromotion(id: number): Promise<void> {
  await pool.execute('UPDATE promotions SET active = 0 WHERE id = ?', [id])
}

export async function listPromotionProducts(): Promise<PromotionProduct[]> {
  const [rows] = await pool.execute<PromotionProductRow[]>(
    `SELECT pp.id, pp.promotion_id, pr.name AS promotion_name, pr.discount_pct,
            pp.product_id, p.name AS product_name, p.price AS original_price
     FROM promotion_products pp
     JOIN promotions pr ON pp.promotion_id = pr.id
     JOIN products p    ON pp.product_id   = p.id
     ORDER BY pr.name, p.name`
  )
  return rows.map((r) => {
    const disc = parseFloat(r.discount_pct)
    const orig = parseFloat(r.original_price)
    return {
      id: r.id,
      promotion_id: r.promotion_id,
      promotion_name: r.promotion_name,
      discount_pct: disc,
      product_id: r.product_id,
      product_name: r.product_name,
      original_price: orig,
      discounted_price: parseFloat((orig * (1 - disc / 100)).toFixed(2)),
    }
  })
}

export async function addProductToPromotion(promotionId: number, productId: number): Promise<void> {
  await pool.execute(
    'INSERT IGNORE INTO promotion_products (promotion_id, product_id) VALUES (?, ?)',
    [promotionId, productId]
  )
}

export async function removeProductFromPromotion(promotionId: number, productId: number): Promise<void> {
  await pool.execute(
    'DELETE FROM promotion_products WHERE promotion_id = ? AND product_id = ?',
    [promotionId, productId]
  )
}
