import { Router } from 'express'
import { authenticateJWT } from '../middlewares/auth'
import { validateBody } from '../middlewares/validate'
import { addCartItemSchema, updateCartItemSchema } from '../schemas/cart.schema'
import * as cartController from '../controllers/cart.controller'

const router = Router()

router.use(authenticateJWT)

router.get('/', cartController.list)
router.post('/', validateBody(addCartItemSchema), cartController.add)
router.put('/:productId', validateBody(updateCartItemSchema), cartController.update)
// DELETE / (clear all) must be registered before DELETE /:productId to avoid
// path-to-regexp treating an empty segment match as the param route.
router.delete('/', cartController.clear)
router.delete('/:productId', cartController.remove)

export default router
