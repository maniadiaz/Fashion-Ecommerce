import { Router } from 'express'
import { authenticateJWT } from '../middlewares/auth'
import * as wishlistController from '../controllers/wishlist.controller'

const router = Router()

router.get('/', authenticateJWT, wishlistController.list)
router.post('/:productId', authenticateJWT, wishlistController.toggle)

export default router
