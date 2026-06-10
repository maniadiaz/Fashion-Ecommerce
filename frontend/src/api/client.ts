import { useAuthStore } from '../store/authStore'

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Remove Content-Type for FormData so browser sets the correct boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const res = await fetch(`/api${path}`, { ...options, headers })
  const data: unknown = await res.json()

  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && 'error' in data
        ? (data as { error: string }).error
        : 'Request failed'
    throw new Error(msg)
  }
  return data as T
}

export default apiFetch
