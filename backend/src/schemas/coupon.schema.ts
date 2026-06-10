import { z } from 'zod'

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50).regex(/^[A-Za-z0-9_-]+$/, 'Code must be alphanumeric'),
  discount_pct: z.coerce.number().positive().max(100),
  max_uses: z.coerce.number().int().positive(),
  expires_at: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
})

export const updateCouponSchema = createCouponSchema.partial().extend({
  active: z.boolean().optional(),
})

export type CreateCouponInput = z.infer<typeof createCouponSchema>
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>
