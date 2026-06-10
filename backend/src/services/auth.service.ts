import { pool } from '../db/connection'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import type { StringValue } from 'ms'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import { env } from '../config/env'
import { sendWelcomeEmail } from './mailer'

interface UserRow extends RowDataPacket {
  id: number
  name: string
  email: string
  password: string
  role: 'customer' | 'admin'
  created_at: string
}

export interface SafeUser {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
  created_at: string
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<SafeUser> {
  const [existing] = await pool.execute<UserRow[]>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  )
  if (existing.length > 0) {
    throw Object.assign(new Error('Email already registered'), { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashed]
  )

  const safeUser: SafeUser = { id: result.insertId, name, email, role: 'customer', created_at: new Date().toISOString() }

  // Fire-and-forget — mail errors must not break registration.
  sendWelcomeEmail(safeUser).catch((err: unknown) => {
    console.error('[mailer] welcome:', err)
  })

  return safeUser
}

export async function loginUser(email: string, password: string): Promise<string> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, name, email, password, role FROM users WHERE email = ?',
    [email]
  )
  const user = rows[0]
  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  const expiresIn = env.JWT_EXPIRES_IN as StringValue
  return jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn }
  )
}

export async function getUserById(id: number): Promise<SafeUser | null> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [id]
  )
  const user = rows[0]
  if (!user) return null
  return { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at }
}

export async function getUserByEmail(email: string): Promise<SafeUser | null> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, name, email, role, created_at FROM users WHERE email = ?',
    [email]
  )
  const user = rows[0]
  if (!user) return null
  return { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at }
}

export async function getSubscribedUsers(): Promise<SafeUser[]> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, name, email, role, created_at FROM users WHERE email_notifications = TRUE'
  )
  return rows.map((u) => ({
    id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at,
  }))
}

interface ResetRow extends RowDataPacket {
  id: number
  user_id: number
  used: number
}

export async function createPasswordReset(email: string): Promise<{ token: string; user: SafeUser } | null> {
  const user = await getUserByEmail(email)
  if (!user) return null

  // Invalidate any existing unused tokens for this user.
  await pool.execute(
    'UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0',
    [user.id]
  )

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ')

  await pool.execute<ResultSetHeader>(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, token, expiresAt]
  )

  return { token, user }
}

export async function consumePasswordReset(token: string, newPassword: string): Promise<void> {
  const [rows] = await pool.execute<ResetRow[]>(
    `SELECT id, user_id, used FROM password_resets
     WHERE token = ? AND used = 0 AND expires_at > NOW()`,
    [token]
  )
  const reset = rows[0]
  if (!reset) {
    throw Object.assign(new Error('Invalid or expired reset token'), { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, reset.user_id])
  await pool.execute('UPDATE password_resets SET used = 1 WHERE id = ?', [reset.id])
}
