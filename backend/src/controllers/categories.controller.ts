import { Request, Response } from 'express'
import * as categoriesService from '../services/categories.service'

export async function list(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await categoriesService.getCategories()
    res.json({ categories })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}
