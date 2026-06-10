import { apiFetch } from './client'
import type { User } from '../types/auth'

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterResponse {
  user: User
}

export function apiRegister(data: { name: string; email: string; password: string }) {
  return apiFetch<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function apiLogin(data: { email: string; password: string }) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function apiGetMe() {
  return apiFetch<{ user: User }>('/api/auth/me')
}
