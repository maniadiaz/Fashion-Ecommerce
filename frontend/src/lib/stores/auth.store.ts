import { writable, derived } from 'svelte/store'
import type { User, AuthState } from '../types/auth'

const STORAGE_KEY = 'veln_auth'

function loadFromStorage(): AuthState {
  if (typeof localStorage === 'undefined') return { user: null, token: null }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, token: null }
    return JSON.parse(raw) as AuthState
  } catch {
    return { user: null, token: null }
  }
}

const initial = loadFromStorage()
export const authStore = writable<AuthState>(initial)

authStore.subscribe((state) => {
  if (typeof localStorage === 'undefined') return
  if (state.token) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
})

export function login(token: string, user: User): void {
  authStore.set({ token, user })
}

export function logout(): void {
  authStore.set({ user: null, token: null })
}

export const isAdmin = derived(authStore, ($auth) => $auth.user?.role === 'admin')
export const isLoggedIn = derived(authStore, ($auth) => $auth.user !== null && $auth.token !== null)
