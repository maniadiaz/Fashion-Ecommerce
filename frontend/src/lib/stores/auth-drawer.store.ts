import { writable } from 'svelte/store'

export type AuthTab = 'login' | 'register'

interface AuthDrawerState {
  open: boolean
  tab: AuthTab
}

const { subscribe, set, update } = writable<AuthDrawerState>({ open: false, tab: 'login' })

export const authDrawerStore = { subscribe }

export function openAuthDrawer(tab: AuthTab = 'login'): void {
  set({ open: true, tab })
}

export function closeAuthDrawer(): void {
  update((s) => ({ ...s, open: false }))
}

export function setAuthTab(tab: AuthTab): void {
  update((s) => ({ ...s, tab }))
}
