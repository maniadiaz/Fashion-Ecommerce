import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

interface JwtPayload {
  id: number
  role: 'customer' | 'admin'
}

function isJwtPayload(payload: unknown): payload is JwtPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as Record<string, unknown>).id === 'number' &&
    ((payload as Record<string, unknown>).role === 'customer' ||
      (payload as Record<string, unknown>).role === 'admin')
  )
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    if (!isJwtPayload(decoded)) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    req.user = { id: decoded.id, role: decoded.role }
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
