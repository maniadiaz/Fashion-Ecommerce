import { createConnection } from 'mysql2/promise'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { env } from '../config/env'

function resolveSchema(): string {
  // __dirname is src/db/ when running with tsx (dev / pm2 dev)
  // and dist/db/ when running compiled output.
  // Fall back to the source path relative to cwd so compiled
  // builds work without copying the file to dist/.
  const candidates = [
    resolve(__dirname, 'schema.sql'),
    resolve(process.cwd(), 'src/db/schema.sql'),
  ]
  const found = candidates.find(existsSync)
  if (!found) {
    throw new Error(
      `schema.sql not found. Tried:\n${candidates.map((p) => `  ${p}`).join('\n')}`
    )
  }
  return readFileSync(found, 'utf8')
}

export async function migrate(): Promise<void> {
  // Use a standalone connection (not the pool) so that the
  // USE veln_db; statement persists across all subsequent queries,
  // and CREATE DATABASE can run before the database exists.
  const conn = await createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true,
  })

  try {
    const sql = resolveSchema()
    await conn.query(sql)
    console.log('[db] Schema is up to date')
  } finally {
    await conn.end()
  }
}
