import { pool } from '../db/connection'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { getCart, clearCart } from './cart.service'
import { CreateOrderInput } from '../schemas/order.schema'
import { getUserById } from './auth.service'
import { sendOrderConfirmationEmail } from './mailer'

export interface OrderItem {
  id: number
  product_id: number
  name: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: number
  user_id: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  shipping_name: string
  shipping_address: string
  payment_method: 'card' | 'transfer' | 'cash'
  payment_status: 'pending' | 'paid' | 'failed'
  created_at: string
  items?: OrderItem[]
}

interface OrderRow extends RowDataPacket {
  id: number
  user_id: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: string
  shipping_name: string
  shipping_address: string
  payment_method: 'card' | 'transfer' | 'cash'
  payment_status: 'pending' | 'paid' | 'failed'
  created_at: string
}

interface OrderItemRow extends RowDataPacket {
  id: number
  product_id: number
  name: string
  quantity: number
  unit_price: string
}

export async function createOrder(userId: number, data: CreateOrderInput): Promise<Order> {
  const cartItems = await getCart(userId)
  if (cartItems.length === 0) {
    throw Object.assign(new Error('Cart is empty'), { status: 400 })
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [orderResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO orders (user_id, total, shipping_name, shipping_address, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, 'paid')`,
      [userId, total.toFixed(2), data.shipping_name, data.shipping_address, data.payment_method]
    )
    const orderId = orderResult.insertId

    for (const item of cartItems) {
      const [[product]] = await conn.execute<RowDataPacket[]>(
        'SELECT price FROM products WHERE id = ?',
        [item.productId]
      )
      const unitPrice = parseFloat((product as { price: string }).price)

      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, unitPrice]
      )

      await conn.execute(
        'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
        [item.quantity, item.productId]
      )
    }

    await conn.commit()
    await clearCart(userId)

    const order = await getOrderById(orderId, userId)
    if (!order) throw new Error('Failed to retrieve created order')

    // Fire-and-forget — mail errors must not roll back the order.
    getUserById(userId).then((user) => {
      if (user) {
        sendOrderConfirmationEmail(user, order).catch((err: unknown) => {
          console.error('[mailer] order-confirmation:', err)
        })
      }
    }).catch(() => {})

    return order
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const [rows] = await pool.execute<OrderRow[]>(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  )
  return rows.map((r) => ({ ...r, total: parseFloat(r.total) }))
}

export async function getOrderById(orderId: number, userId: number): Promise<Order | null> {
  const [rows] = await pool.execute<OrderRow[]>(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId]
  )
  const order = rows[0]
  if (!order) return null

  const [itemRows] = await pool.execute<OrderItemRow[]>(
    `SELECT oi.id, oi.product_id, p.name, oi.quantity, oi.unit_price
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  )

  return {
    ...order,
    total: parseFloat(order.total),
    items: itemRows.map((i) => ({ ...i, unit_price: parseFloat(i.unit_price) })),
  }
}
