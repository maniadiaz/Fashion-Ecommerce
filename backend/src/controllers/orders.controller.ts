import { Request, Response } from 'express'
import * as ordersService from '../services/orders.service'
import { CreateOrderInput } from '../schemas/order.schema'

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body as CreateOrderInput
    const order = await ordersService.createOrder(req.user!.id, data)
    res.status(201).json({ order })
  } catch (err) {
    const error = err as Error & { status?: number }
    res.status(error.status ?? 500).json({ error: error.message })
  }
}

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const orders = await ordersService.getUserOrders(req.user!.id)
    res.json({ orders })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function detail(req: Request, res: Response): Promise<void> {
  try {
    const orderId = parseInt(req.params.id as string)
    if (isNaN(orderId)) {
      res.status(400).json({ error: 'Invalid order ID' })
      return
    }
    const order = await ordersService.getOrderById(orderId, req.user!.id)
    if (!order) {
      res.status(404).json({ error: 'Order not found' })
      return
    }
    res.json({ order })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}
