import { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { sendPasswordResetEmail } from '../services/mailer'
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '../schemas/auth.schema'

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body as RegisterInput
    const user = await authService.registerUser(name, email, password)
    res.status(201).json({ user })
  } catch (err) {
    const error = err as Error & { status?: number }
    res.status(error.status ?? 500).json({ error: error.message })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput
    const token = await authService.loginUser(email, password)
    const user = await authService.getUserById(
      (JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as { id: number }).id
    )
    res.json({ token, user })
  } catch (err) {
    const error = err as Error & { status?: number }
    res.status(error.status ?? 500).json({ error: error.message })
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.getUserById(req.user!.id)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json({ user })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body as ForgotPasswordInput
    const result = await authService.createPasswordReset(email)
    // Always respond 200 to avoid leaking whether the email exists.
    if (result) {
      // Fire-and-forget — don't let mail errors block the HTTP response.
      sendPasswordResetEmail(result.user, result.token).catch((err: unknown) => {
        console.error('[mailer] forgot-password:', err)
      })
    }
    res.json({ message: 'If that email is registered, a reset link has been sent.' })
  } catch (err) {
    const error = err as Error
    res.status(500).json({ error: error.message })
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = req.body as ResetPasswordInput
    await authService.consumePasswordReset(token, password)
    res.json({ message: 'Password updated successfully.' })
  } catch (err) {
    const error = err as Error & { status?: number }
    res.status(error.status ?? 500).json({ error: error.message })
  }
}
