import { pool } from '../db/connection'
import { RowDataPacket } from 'mysql2'

export interface AdminOrder {
  id: number
  user_email: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  payment_method: 'card' | 'transfer' | 'cash'
  payment_status: 'pending' | 'paid' | 'failed'
  created_at: string
}

export interface InventoryItem {
  id: number
  name: string
  price: number
  stock: number
  active: boolean
  category_name: string
}

interface AdminOrderRow extends RowDataPacket {
  id: number
  user_email: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: string
  payment_method: 'card' | 'transfer' | 'cash'
  payment_status: 'pending' | 'paid' | 'failed'
  created_at: string
}

interface InventoryRow extends RowDataPacket {
  id: number
  name: string
  price: string
  stock: number
  active: number
  category_name: string
}

export async function getAllOrders(): Promise<AdminOrder[]> {
  const [rows] = await pool.execute<AdminOrderRow[]>(
    `SELECT o.id, u.email AS user_email, o.status, o.total, o.payment_method, o.payment_status, o.created_at
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC`
  )
  return rows.map((r) => ({ ...r, total: parseFloat(r.total) }))
}

export async function updateOrderStatus(
  orderId: number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
): Promise<void> {
  await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId])
}

export async function getInventory(): Promise<InventoryItem[]> {
  const [rows] = await pool.execute<InventoryRow[]>(
    `SELECT p.id, p.name, p.price, p.stock, p.active, c.name AS category_name
     FROM products p
     JOIN categories c ON p.category_id = c.id
     ORDER BY p.name`
  )
  return rows.map((r) => ({
    ...r,
    price: parseFloat(r.price),
    active: r.active === 1,
  }))
}

export async function updateStock(productId: number, stock: number): Promise<void> {
  await pool.execute('UPDATE products SET stock = ? WHERE id = ?', [stock, productId])
}
