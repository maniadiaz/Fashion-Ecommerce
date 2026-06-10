import { Request, Response } from 'express'
import * as cartService from '../services/cart.service'
import { AddCartItemInput, UpdateCartItemInput } from '../schemas/cart.schema'

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const items = await cartService.getCart(req.user!.id)
    res.json({ items })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function add(req: Request, res: Response): Promise<void> {
  try {
    const { productId, quantity } = req.body as AddCartItemInput
    await cartService.addToCart(req.user!.id, productId, quantity)
    const items = await cartService.getCart(req.user!.id)
    res.json({ items })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const productId = parseInt(req.params.productId as string)
    if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    const { quantity } = req.body as UpdateCartItemInput
    await cartService.updateCartItem(req.user!.id, productId, quantity)
    const items = await cartService.getCart(req.user!.id)
    res.json({ items })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const productId = parseInt(req.params.productId as string)
    if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    await cartService.removeCartItem(req.user!.id, productId)
    res.status(204).send()
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function clear(req: Request, res: Response): Promise<void> {
  try {
    await cartService.clearCart(req.user!.id)
    res.status(204).send()
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}
