import dotenv from 'dotenv'

// Must be the FIRST module imported so process.env is populated before
// any other module reads it at the module level.
dotenv.config()

// ─── Required variables ────────────────────────────────────────────────────
// The server must not start if these are absent.
const REQUIRED = [
  {
    name: 'JWT_SECRET',
    hint: 'Use a random 32+ char string — e.g. run: openssl rand -hex 32',
  },
  {
    name: 'DB_USER',
    hint: 'MySQL username (e.g. root)',
  },
] as const

const missing = REQUIRED.filter(({ name }) => !process.env[name])

if (missing.length > 0) {
  const lines = missing.map(({ name, hint }) => `  ${name}: ${hint}`)
  process.stderr.write(
    `\n[startup] FATAL — missing required environment variables:\n${lines.join('\n')}\n` +
    `\n  Copy backend/.env.example → backend/.env and fill in the values.\n\n`
  )
  process.exit(1)
}

// DB_PASSWORD: allow empty string (passwordless local MySQL dev setups).
// But warn if it is completely absent from the env file.
if (process.env.DB_PASSWORD === undefined) {
  process.stderr.write(
    '[startup] WARNING — DB_PASSWORD is not defined in .env. ' +
    'Using empty string. Set it if your MySQL requires a password.\n'
  )
}

// ─── Exported config ───────────────────────────────────────────────────────
// Everything is typed as non-nullable from this point on.
export const env = {
  PORT: parseInt(process.env.PORT ?? '3001', 10),
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT ?? '3306', 10),
  DB_USER: process.env.DB_USER as string,
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_NAME: process.env.DB_NAME ?? 'veln_db',
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? './uploads',
  MAIL_HOST: process.env.MAIL_HOST ?? 'smtp.ethereal.email',
  MAIL_PORT: parseInt(process.env.MAIL_PORT ?? '587', 10),
  MAIL_USER: process.env.MAIL_USER ?? '',
  MAIL_PASS: process.env.MAIL_PASS ?? '',
  MAIL_FROM: process.env.MAIL_FROM ?? 'VELN <noreply@veln.com>',
} as const
