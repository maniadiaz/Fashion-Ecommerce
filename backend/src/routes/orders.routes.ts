import { Router } from 'express'
import { authenticateJWT } from '../middlewares/auth'
import { validateBody } from '../middlewares/validate'
import { createOrderSchema } from '../schemas/order.schema'
import * as ordersController from '../controllers/orders.controller'

const router = Router()

router.use(authenticateJWT)

router.get('/', ordersController.list)
router.get('/:id', ordersController.detail)
router.post('/', validateBody(createOrderSchema), ordersController.create)

export default router
