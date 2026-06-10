import { pool } from '../db/connection'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

interface WishlistRow extends RowDataPacket {
  product_id: number
}

export async function getWishlist(userId: number): Promise<number[]> {
  const [rows] = await pool.execute<WishlistRow[]>(
    'SELECT product_id FROM wishlists WHERE user_id = ?',
    [userId]
  )
  return rows.map((r) => r.product_id)
}

export async function toggleWishlist(userId: number, productId: number): Promise<{ added: boolean }> {
  const [existing] = await pool.execute<WishlistRow[]>(
    'SELECT product_id FROM wishlists WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  )

  if (existing.length > 0) {
    await pool.execute('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId])
    return { added: false }
  }

  await pool.execute<ResultSetHeader>(
    'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
    [userId, productId]
  )
  return { added: true }
}
