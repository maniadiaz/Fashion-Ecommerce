import { Request, Response } from 'express'
import * as adminService from '../services/admin.service'
import { UpdateOrderStatusInput } from '../schemas/order.schema'

function parsePagination(req: Request, defaultLimit = 10) {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1')) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? String(defaultLimit))) || defaultLimit))
  return { page, limit }
}

export async function listOrders(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit } = parsePagination(req)
    const result = await adminService.getAllOrders(page, limit)
    res.json({ orders: result.data, total: result.total, page: result.page, limit: result.limit })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const orderId = parseInt(req.params.id as string)
    if (isNaN(orderId)) {
      res.status(400).json({ error: 'Invalid order ID' })
      return
    }
    const { status } = req.body as UpdateOrderStatusInput
    await adminService.updateOrderStatus(orderId, status)
    res.json({ success: true })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function listInventory(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit } = parsePagination(req)
    const result = await adminService.getInventory(page, limit)
    res.json({ inventory: result.data, total: result.total, page: result.page, limit: result.limit })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function cancelOrder(req: Request, res: Response): Promise<void> {
  try {
    const orderId = parseInt(req.params.id as string)
    if (isNaN(orderId)) { res.status(400).json({ error: 'Invalid order ID' }); return }
    await adminService.cancelOrder(orderId)
    res.json({ success: true })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function updateStock(req: Request, res: Response): Promise<void> {
  try {
    const productId = parseInt(req.params.id as string)
    if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    const stock = parseInt(String(req.body.stock))
    if (isNaN(stock) || stock < 0) {
      res.status(400).json({ error: 'Invalid stock value' })
      return
    }
    await adminService.updateStock(productId, stock)
    res.json({ success: true })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}
