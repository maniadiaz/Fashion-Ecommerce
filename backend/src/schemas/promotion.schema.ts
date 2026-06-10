import { z } from 'zod'

export const createPromotionSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  discount_pct: z.coerce.number().positive().max(100),
  starts_at: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
  ends_at: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
})

export const updatePromotionSchema = createPromotionSchema.partial().extend({
  active: z.boolean().optional(),
})

export const promotionProductSchema = z.object({
  product_id: z.coerce.number().int().positive(),
})

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>
export type PromotionProductInput = z.infer<typeof promotionProductSchema>
