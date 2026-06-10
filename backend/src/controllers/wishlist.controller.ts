import { Request, Response } from 'express'
import * as wishlistService from '../services/wishlist.service'

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const productIds = await wishlistService.getWishlist(req.user!.id)
    res.json({ productIds })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function toggle(req: Request, res: Response): Promise<void> {
  try {
    const productId = parseInt(req.params.productId as string)
    if (isNaN(productId)) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    const result = await wishlistService.toggleWishlist(req.user!.id, productId)
    res.json(result)
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}
