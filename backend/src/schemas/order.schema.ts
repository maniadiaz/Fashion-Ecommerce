import { z } from 'zod'

export const createOrderSchema = z.object({
  shipping_name: z.string().min(2, 'Full name is required'),
  shipping_address: z.string().min(5, 'Address is required'),
  payment_method: z.enum(['card', 'transfer', 'cash']),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
