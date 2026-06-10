// env MUST be the very first import so dotenv.config() runs before any
// other module reads process.env at the module level.
import { env } from './config/env'

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import authRouter from './routes/auth.routes'
import productsRouter from './routes/products.routes'
import categoriesRouter from './routes/categories.routes'
import wishlistRouter from './routes/wishlist.routes'
import cartRouter from './routes/cart.routes'
import ordersRouter from './routes/orders.routes'
import adminRouter from './routes/admin.routes'
import { migrate } from './db/migrate'

export const app = express()

app.use(cors({ origin: env.FRONTEND_URL }))
app.use(express.json())

// Serve uploaded images
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)))

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/admin', adminRouter)

// 404 — no route matched
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler — 4-arg signature required by Express
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  const message = err instanceof Error ? err.message : 'Internal server error'
  res.status(500).json({ error: message })
})

if (require.main === module) {
  migrate()
    .then(() => {
      app.listen(env.PORT, () => {
        console.log(`VELN backend running on http://localhost:${env.PORT}`)
      })
    })
    .catch((err: unknown) => {
      console.error('[db] Migration failed — server will not start')
      console.error(err)
      process.exit(1)
    })
}
