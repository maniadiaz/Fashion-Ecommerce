import { Request, Response } from 'express'
import * as productsService from '../services/products.service'
import { CreateProductInput, UpdateProductInput } from '../schemas/product.schema'

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined
    const products = await productsService.getProducts(category)
    res.json({ products })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function detail(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    const product = await productsService.getProductById(id)
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.json({ product })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body as CreateProductInput
    const imageUrl = (req.file as Express.Multer.File | undefined)?.filename
    const product = await productsService.createProduct(data, imageUrl)
    res.status(201).json({ product })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    const data = req.body as UpdateProductInput
    const product = await productsService.updateProduct(id, data)
    if (!product) {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.json({ product })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function softDelete(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid product ID' })
      return
    }
    await productsService.softDeleteProduct(id)
    res.status(204).send()
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}
