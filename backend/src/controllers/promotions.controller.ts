import { Request, Response } from 'express'
import * as svc from '../services/promotions.service'
import type { CreatePromotionInput, UpdatePromotionInput, PromotionProductInput } from '../schemas/promotion.schema'

export async function listPromotions(_req: Request, res: Response): Promise<void> {
  try {
    res.json({ promotions: await svc.listPromotions() })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}

export async function createPromotion(req: Request, res: Response): Promise<void> {
  try {
    const promotion = await svc.createPromotion(req.body as CreatePromotionInput)
    res.status(201).json({ promotion })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}

export async function updatePromotion(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string)
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return }
    await svc.updatePromotion(id, req.body as UpdatePromotionInput)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}

export async function deletePromotion(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string)
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return }
    await svc.deletePromotion(id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}

export async function listPromotionProducts(_req: Request, res: Response): Promise<void> {
  try {
    res.json({ items: await svc.listPromotionProducts() })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}

export async function addProductToPromotion(req: Request, res: Response): Promise<void> {
  try {
    const promotionId = parseInt(req.params.id as string)
    if (isNaN(promotionId)) { res.status(400).json({ error: 'Invalid promotion ID' }); return }
    const { product_id } = req.body as PromotionProductInput
    await svc.addProductToPromotion(promotionId, product_id)
    res.status(201).json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}

export async function removeProductFromPromotion(req: Request, res: Response): Promise<void> {
  try {
    const promotionId = parseInt(req.params.id as string)
    const productId = parseInt(req.params.productId as string)
    if (isNaN(promotionId) || isNaN(productId)) { res.status(400).json({ error: 'Invalid ID' }); return }
    await svc.removeProductFromPromotion(promotionId, productId)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}
