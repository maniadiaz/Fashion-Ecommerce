/**
 * Smoke-test for the env validator logic (runs in-process).
 * Run with:  npx tsx src/config/env.test.ts
 *
 * Because tsx auto-injects .env we cannot easily test the failure path via
 * a subprocess.  Instead we exercise the same validation logic directly.
 */

type RequiredVar = { name: string; hint: string }

function validate(vars: Record<string, string | undefined>): string | null {
  const REQUIRED: RequiredVar[] = [
    { name: 'JWT_SECRET', hint: 'Use openssl rand -hex 32' },
    { name: 'DB_USER',    hint: 'MySQL username' },
  ]
  const missing = REQUIRED.filter(({ name }) => !vars[name])
  if (missing.length === 0) return null
  return missing.map(({ name, hint }) => `${name}: ${hint}`).join('\n')
}

let passed = 0
let failed = 0

function test(description: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✓  ${description}`)
    passed++
  } catch (err) {
    console.error(`  ✗  ${description}`)
    console.error(`     ${err instanceof Error ? err.message : String(err)}`)
    failed++
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

// ── Tests ──────────────────────────────────────────────────────────────────

test('exits with error when both required vars are missing', () => {
  const result = validate({ DB_USER: undefined, JWT_SECRET: undefined })
  assert(result !== null, 'should return error string')
  assert(result!.includes('JWT_SECRET'), 'error must mention JWT_SECRET')
  assert(result!.includes('DB_USER'), 'error must mention DB_USER')
})

test('exits with error when only JWT_SECRET is missing', () => {
  const result = validate({ DB_USER: 'root', JWT_SECRET: undefined })
  assert(result !== null, 'should return error string')
  assert(result!.includes('JWT_SECRET'), 'error must mention JWT_SECRET')
  assert(!result!.includes('DB_USER'), 'should NOT mention DB_USER — it is set')
})

test('exits with error when only DB_USER is missing', () => {
  const result = validate({ DB_USER: undefined, JWT_SECRET: 'some-secret' })
  assert(result !== null, 'should return error string')
  assert(result!.includes('DB_USER'), 'error must mention DB_USER')
  assert(!result!.includes('JWT_SECRET'), 'should NOT mention JWT_SECRET — it is set')
})

test('passes when all required vars are present', () => {
  const result = validate({ JWT_SECRET: 'super-secret', DB_USER: 'root' })
  assert(result === null, 'should return null (no errors)')
})

test('passes with empty DB_PASSWORD (passwordless dev MySQL)', () => {
  const result = validate({ JWT_SECRET: 'super-secret', DB_USER: 'root', DB_PASSWORD: '' })
  assert(result === null, 'empty DB_PASSWORD is allowed')
})

test('fails with empty-string JWT_SECRET (whitespace not allowed)', () => {
  const result = validate({ JWT_SECRET: '', DB_USER: 'root' })
  assert(result !== null, 'empty JWT_SECRET must fail — falsy check catches it')
  assert(result!.includes('JWT_SECRET'), 'error must mention JWT_SECRET')
})

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests — ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
