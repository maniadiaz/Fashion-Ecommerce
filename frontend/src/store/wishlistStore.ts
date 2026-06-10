import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  items: number[]
  toggleItem: (id: number) => void
  isWished: (id: number) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (id) =>
        set((state) => ({
          items: state.items.includes(id)
            ? state.items.filter((i) => i !== id)
            : [...state.items, id],
        })),
      isWished: (id) => get().items.includes(id),
    }),
    { name: 'veln-wishlist' },
  ),
)
