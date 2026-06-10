import { writable } from 'svelte/store'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

export const toastStore = writable<ToastMessage[]>([])

export function addToast(
  message: string,
  type: ToastMessage['type'] = 'info',
  duration = 3000
): void {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  toastStore.update((toasts) => [...toasts, { id, message, type, duration }])

  setTimeout(() => {
    toastStore.update((toasts) => toasts.filter((t) => t.id !== id))
  }, duration)
}

export function removeToast(id: string): void {
  toastStore.update((toasts) => toasts.filter((t) => t.id !== id))
}
