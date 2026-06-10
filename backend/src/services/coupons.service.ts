import { pool } from '../db/connection'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export interface Coupon {
  id: number
  code: string
  discount_pct: number
  max_uses: number
  used_count: number
  expires_at: string
  active: boolean
  created_at: string
}

interface CouponRow extends RowDataPacket {
  id: number
  code: string
  discount_pct: string
  max_uses: number
  used_count: number
  expires_at: string
  active: number
  created_at: string
}

export async function listCoupons(): Promise<Coupon[]> {
  const [rows] = await pool.execute<CouponRow[]>(
    'SELECT * FROM coupons ORDER BY created_at DESC'
  )
  return rows.map((r) => ({
    ...r,
    discount_pct: parseFloat(r.discount_pct),
    active: r.active === 1,
  }))
}

export async function createCoupon(data: {
  code: string
  discount_pct: number
  max_uses: number
  expires_at: string
}): Promise<Coupon> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO coupons (code, discount_pct, max_uses, expires_at) VALUES (?, ?, ?, ?)',
    [data.code.toUpperCase(), data.discount_pct, data.max_uses, data.expires_at]
  )
  const [rows] = await pool.execute<CouponRow[]>(
    'SELECT * FROM coupons WHERE id = ?',
    [result.insertId]
  )
  const r = rows[0]
  return { ...r, discount_pct: parseFloat(r.discount_pct), active: r.active === 1 }
}

export async function updateCoupon(
  id: number,
  data: {
    code?: string
    discount_pct?: number
    max_uses?: number
    expires_at?: string
    active?: boolean
  }
): Promise<void> {
  const fields: string[] = []
  const values: unknown[] = []

  if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code.toUpperCase()) }
  if (data.discount_pct !== undefined) { fields.push('discount_pct = ?'); values.push(data.discount_pct) }
  if (data.max_uses !== undefined) { fields.push('max_uses = ?'); values.push(data.max_uses) }
  if (data.expires_at !== undefined) { fields.push('expires_at = ?'); values.push(data.expires_at) }
  if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active ? 1 : 0) }

  if (fields.length === 0) return
  values.push(id)
  await pool.execute(`UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`, values as (string | number | boolean | null)[])
}

export async function deleteCoupon(id: number): Promise<void> {
  await pool.execute('DELETE FROM coupons WHERE id = ?', [id])
}
