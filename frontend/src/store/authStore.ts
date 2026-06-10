import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAdmin: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAdmin: false,
      login: (user, token) => set({ user, token, isAdmin: user.role === 'admin' }),
      logout: () => set({ user: null, token: null, isAdmin: false }),
    }),
    { name: 'veln-auth' },
  ),
)
