import { pool } from '../db/connection'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

export interface CartItemFull {
  id: number
  productId: number
  name: string
  price: number
  image_url: string | null
  quantity: number
}

interface CartRow extends RowDataPacket {
  id: number
  productId: number
  name: string
  price: string
  image_url: string | null
  quantity: number
}

export async function getCart(userId: number): Promise<CartItemFull[]> {
  const [rows] = await pool.execute<CartRow[]>(
    `SELECT ci.id, ci.product_id AS productId, p.name, p.price, p.image_url, ci.quantity
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = ?
     ORDER BY ci.added_at ASC`,
    [userId]
  )
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    name: r.name,
    price: parseFloat(r.price),
    image_url: r.image_url,
    quantity: r.quantity,
  }))
}

export async function addToCart(userId: number, productId: number, quantity: number): Promise<void> {
  await pool.execute<ResultSetHeader>(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [userId, productId, quantity]
  )
}

export async function updateCartItem(userId: number, productId: number, quantity: number): Promise<void> {
  await pool.execute(
    'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
    [quantity, userId, productId]
  )
}

export async function removeCartItem(userId: number, productId: number): Promise<void> {
  await pool.execute(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  )
}

export async function clearCart(userId: number): Promise<void> {
  await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [userId])
}
