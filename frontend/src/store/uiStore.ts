import { create } from 'zustand'

interface UiState {
  cartOpen: boolean
  authOpen: boolean
  openCart: () => void
  closeCart: () => void
  openAuth: () => void
  closeAuth: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  cartOpen: false,
  authOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  openAuth: () => set({ authOpen: true }),
  closeAuth: () => set({ authOpen: false }),
}))
