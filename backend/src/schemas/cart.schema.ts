import { z } from 'zod'

export const addCartItemSchema = z.object({
  productId: z.number().int().positive('Product ID required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export type AddCartItemInput = z.infer<typeof addCartItemSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
