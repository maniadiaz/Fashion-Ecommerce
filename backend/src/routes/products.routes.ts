import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { validateBody } from '../middlewares/validate'
import { authenticateJWT } from '../middlewares/auth'
import { requireAdmin } from '../middlewares/admin'
import { createProductSchema, updateProductSchema } from '../schemas/product.schema'
import * as productsController from '../controllers/products.controller'
import { env } from '../config/env'

const uploadDir = env.UPLOAD_DIR

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const upload = multer({ storage })

const router = Router()

router.get('/', productsController.list)
router.get('/:id', productsController.detail)
router.post('/', authenticateJWT, requireAdmin, upload.single('image'), validateBody(createProductSchema), productsController.create)
router.put('/:id', authenticateJWT, requireAdmin, validateBody(updateProductSchema), productsController.update)
router.delete('/:id', authenticateJWT, requireAdmin, productsController.softDelete)

export default router
