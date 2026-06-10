import { pool } from '../db/connection'
import { RowDataPacket } from 'mysql2'

export interface Category {
  id: number
  name: string
  slug: string
}

interface CategoryRow extends RowDataPacket {
  id: number
  name: string
  slug: string
}

export async function getCategories(): Promise<Category[]> {
  const [rows] = await pool.execute<CategoryRow[]>(
    'SELECT id, name, slug FROM categories ORDER BY name'
  )
  return rows
}
