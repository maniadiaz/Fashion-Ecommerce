import { Router } from 'express'
import { z } from 'zod'
import { authenticateJWT } from '../middlewares/auth'
import { requireAdmin } from '../middlewares/admin'
import { validateBody } from '../middlewares/validate'
import { updateOrderStatusSchema } from '../schemas/order.schema'
import { createPromotionSchema, updatePromotionSchema, promotionProductSchema } from '../schemas/promotion.schema'
import { createCouponSchema, updateCouponSchema } from '../schemas/coupon.schema'
import * as adminController from '../controllers/admin.controller'
import * as promotionsController from '../controllers/promotions.controller'
import * as couponsController from '../controllers/coupons.controller'

const router = Router()

router.use(authenticateJWT, requireAdmin)

// Orders
router.get('/orders', adminController.listOrders)
router.put('/orders/:id', validateBody(updateOrderStatusSchema), adminController.updateOrderStatus)

// Inventory
router.get('/inventory', adminController.listInventory)
router.put('/inventory/:id', validateBody(z.object({ stock: z.coerce.number().int().min(0) })), adminController.updateStock)

// Promotions
router.get('/promotions', promotionsController.listPromotions)
router.post('/promotions', validateBody(createPromotionSchema), promotionsController.createPromotion)
router.put('/promotions/:id', validateBody(updatePromotionSchema), promotionsController.updatePromotion)
router.delete('/promotions/:id', promotionsController.deletePromotion)

// Product-Promotions (associating products to a promotion)
router.get('/promotion-products', promotionsController.listPromotionProducts)
router.post('/promotions/:id/products', validateBody(promotionProductSchema), promotionsController.addProductToPromotion)
router.delete('/promotions/:id/products/:productId', promotionsController.removeProductFromPromotion)

// Coupons
router.get('/coupons', couponsController.listCoupons)
router.post('/coupons', validateBody(createCouponSchema), couponsController.createCoupon)
router.put('/coupons/:id', validateBody(updateCouponSchema), couponsController.updateCoupon)
router.delete('/coupons/:id', couponsController.deleteCoupon)

export default router
