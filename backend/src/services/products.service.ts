import { pool } from '../db/connection'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { CreateProductInput, UpdateProductInput } from '../schemas/product.schema'

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
  badge: 'new' | 'sale' | 'limited' | null
  category_id: number
  category_name: string
  category_slug: string
  active: boolean
  created_at: string
}

export interface PaginatedProducts {
  products: Product[]
  total: number
  page: number
  limit: number
}

interface ProductRow extends RowDataPacket {
  id: number
  name: string
  description: string | null
  price: string
  stock: number
  image_url: string | null
  badge: 'new' | 'sale' | 'limited' | null
  category_id: number
  category_name: string
  category_slug: string
  active: number
  created_at: string
}

interface CountRow extends RowDataPacket {
  total: number
}

function toProduct(row: ProductRow): Product {
  return {
    ...row,
    price: parseFloat(row.price),
    active: row.active === 1,
  }
}

export async function getProducts(
  categorySlug?: string,
  page = 1,
  limit = 20,
  includeInactive = false
): Promise<PaginatedProducts> {
  const offset = (page - 1) * limit

  let where = includeInactive ? 'WHERE 1=1' : 'WHERE p.active = 1'
  const params: (string | number)[] = []

  if (categorySlug) {
    where += ' AND c.slug = ?'
    params.push(categorySlug)
  }

  const baseQuery = `
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ${where}
  `

  const [[countRow]] = await pool.execute<CountRow[]>(
    `SELECT COUNT(*) AS total ${baseQuery}`,
    params
  )

  const [rows] = await pool.execute<ProductRow[]>(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug ${baseQuery} ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params
  )

  return {
    products: rows.map(toProduct),
    total: countRow.total,
    page,
    limit,
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  const [rows] = await pool.execute<ProductRow[]>(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     JOIN categories c ON p.category_id = c.id
     WHERE p.id = ? AND p.active = 1`,
    [id]
  )
  const row = rows[0]
  return row ? toProduct(row) : null
}

export async function createProduct(
  data: CreateProductInput,
  imageUrl?: string
): Promise<Product> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO products (name, description, price, stock, image_url, badge, category_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.description ?? null, data.price, data.stock, imageUrl ?? null, data.badge ?? null, data.category_id]
  )
  const product = await getProductById(result.insertId)
  if (!product) throw new Error('Failed to create product')
  return product
}

export async function updateProduct(id: number, data: UpdateProductInput): Promise<Product | null> {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
  if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price) }
  if (data.stock !== undefined) { fields.push('stock = ?'); values.push(data.stock) }
  if (data.badge !== undefined) { fields.push('badge = ?'); values.push(data.badge) }
  if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id) }

  if (fields.length === 0) return getProductById(id)

  values.push(id)
  await pool.execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values)
  return getProductById(id)
}

export async function softDeleteProduct(id: number): Promise<void> {
  await pool.execute('UPDATE products SET active = 0 WHERE id = ?', [id])
}
