import { writable, derived, get } from 'svelte/store'
import { authStore } from './auth.store'
import { apiToggleWishlist, apiGetWishlist } from '../api/wishlist'

const STORAGE_KEY = 'veln_wishlist'

function loadFromStorage(): Set<number> {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set()
  } catch {
    return new Set()
  }
}

export const wishlistStore = writable<Set<number>>(loadFromStorage())

wishlistStore.subscribe((set) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
})

export const isInWishlist = (productId: number) =>
  derived(wishlistStore, ($w) => $w.has(productId))

export async function toggleWishlist(productId: number): Promise<void> {
  const auth = get(authStore)
  if (auth.token) {
    try {
      const { added } = await apiToggleWishlist(productId)
      wishlistStore.update((set) => {
        const next = new Set(set)
        if (added) next.add(productId)
        else next.delete(productId)
        return next
      })
      return
    } catch {
      // Fall through to local toggle on error
    }
  }
  wishlistStore.update((set) => {
    const next = new Set(set)
    if (next.has(productId)) next.delete(productId)
    else next.add(productId)
    return next
  })
}

export async function syncWishlist(): Promise<void> {
  const auth = get(authStore)
  if (!auth.token) return
  try {
    const { productIds } = await apiGetWishlist()
    wishlistStore.set(new Set(productIds))
  } catch {
    // ignore sync errors
  }
}
