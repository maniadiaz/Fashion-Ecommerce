export interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
}
