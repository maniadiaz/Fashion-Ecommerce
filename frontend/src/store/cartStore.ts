import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  totalItems: number
  subtotal: number
  addItem: (item: CartItem) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

function calcTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id)
          const updated = existing
            ? state.items.map((i) =>
                i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i,
              )
            : [...state.items, item]
          return { items: updated, ...calcTotals(updated) }
        }),

      removeItem: (productId) =>
        set((state) => {
          const updated = state.items.filter((i) => i.product_id !== productId)
          return { items: updated, ...calcTotals(updated) }
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const updated =
            quantity <= 0
              ? state.items.filter((i) => i.product_id !== productId)
              : state.items.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
          return { items: updated, ...calcTotals(updated) }
        }),

      clearCart: () => set({ items: [], totalItems: 0, subtotal: 0 }),
    }),
    { name: 'veln-cart' },
  ),
)
