export interface Category {
  id: number
  name: string
  slug: string
}

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
