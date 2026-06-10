import { writable, derived } from 'svelte/store'
import type { CartItem } from '../types/cart'
import type { Product } from '../types/product'

const STORAGE_KEY = 'veln_cart'

function loadFromStorage(): CartItem[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export const cartStore = writable<CartItem[]>(loadFromStorage())

cartStore.subscribe((items) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
})

export const cartCount = derived(cartStore, ($cart) =>
  $cart.reduce((sum, item) => sum + item.quantity, 0)
)

export const cartTotal = derived(cartStore, ($cart) =>
  $cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

export function addToCart(product: Product, quantity = 1): void {
  cartStore.update((items) => {
    const existing = items.find((i) => i.productId === product.id)
    if (existing) {
      return items.map((i) =>
        i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
      )
    }
    return [
      ...items,
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity,
      },
    ]
  })
}

export function removeFromCart(productId: number): void {
  cartStore.update((items) => items.filter((i) => i.productId !== productId))
}

export function updateQuantity(productId: number, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(productId)
    return
  }
  cartStore.update((items) =>
    items.map((i) => (i.productId === productId ? { ...i, quantity } : i))
  )
}

export function clearCart(): void {
  cartStore.set([])
}
