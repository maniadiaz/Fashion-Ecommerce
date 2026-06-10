import { Router } from 'express'
import { validateBody } from '../middlewares/validate'
import { authenticateJWT } from '../middlewares/auth'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema'
import * as authController from '../controllers/auth.controller'

const router = Router()

router.post('/register', validateBody(registerSchema), authController.register)
router.post('/login', validateBody(loginSchema), authController.login)
router.get('/me', authenticateJWT, authController.me)
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword)

export default router
