import { Request, Response } from 'express'
import * as svc from '../services/coupons.service'
import type { CreateCouponInput, UpdateCouponInput } from '../schemas/coupon.schema'

export async function listCoupons(_req: Request, res: Response): Promise<void> {
  try {
    res.json({ coupons: await svc.listCoupons() })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}

export async function createCoupon(req: Request, res: Response): Promise<void> {
  try {
    const coupon = await svc.createCoupon(req.body as CreateCouponInput)
    res.status(201).json({ coupon })
  } catch (err) {
    const msg = (err as Error).message
    if (msg.includes('Duplicate entry')) {
      res.status(409).json({ error: 'Coupon code already exists' })
    } else {
      res.status(500).json({ error: msg })
    }
  }
}

export async function updateCoupon(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string)
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return }
    await svc.updateCoupon(id, req.body as UpdateCouponInput)
    res.json({ success: true })
  } catch (err) {
    const msg = (err as Error).message
    if (msg.includes('Duplicate entry')) {
      res.status(409).json({ error: 'Coupon code already exists' })
    } else {
      res.status(500).json({ error: msg })
    }
  }
}

export async function deleteCoupon(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string)
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return }
    await svc.deleteCoupon(id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
}
