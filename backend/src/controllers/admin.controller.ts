import { Request, Response } from 'express'
import * as adminService from '../services/admin.service'
import { UpdateOrderStatusInput } from '../schemas/order.schema'

export async function listOrders(_req: Request, res: Response): Promise<void> {
  try {
    const orders = await adminService.getAllOrders()
    res.json({ orders })
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

export async function listInventory(_req: Request, res: Response): Promise<void> {
  try {
    const inventory = await adminService.getInventory()
    res.json({ inventory })
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
