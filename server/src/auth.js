import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'

const DEFAULT_PARAMS = Object.freeze({ N: 16384, r: 8, p: 1 })
const KEY_LENGTH = 64
const MAX_PARAMS = Object.freeze({ N: 1 << 20, r: 256, p: 64 })

/** Hash a password into `scrypt$N$r$p$salt$hash` (all values hex except params). */
export function hashPassword(password, params = DEFAULT_PARAMS) {
  if (typeof password !== 'string') throw new TypeError('密码必须是字符串')
  const { N, r, p } = params
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) {
    throw new TypeError('scrypt 参数必须是整数')
  }
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEY_LENGTH, {
    N,
    r,
    p,
    maxmem: Math.max(32 * 1024 * 1024, 256 * N * r * p),
  })
  return `scrypt$${N}$${r}$${p}$${salt.toString('hex')}$${hash.toString('hex')}`
}

/** Verify a password against a stored `scrypt$N$r$p$salt$hash` value. */
export function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, rawN, rawR, rawP, saltHex, hashHex] = parts
  if (!/^\d+$/.test(rawN) || !/^\d+$/.test(rawR) || !/^\d+$/.test(rawP)) return false
  const N = Number(rawN)
  const r = Number(rawR)
  const p = Number(rawP)
  if (!Number.isSafeInteger(N) || !Number.isSafeInteger(r) || !Number.isSafeInteger(p)) return false
  if (N < 2 || (N & (N - 1)) !== 0 || N > MAX_PARAMS.N) return false
  if (r < 1 || r > MAX_PARAMS.r || p < 1 || p > MAX_PARAMS.p) return false
  if (!/^[0-9a-f]+$/i.test(saltHex) || saltHex.length % 2 !== 0) return false
  if (!/^[0-9a-f]+$/i.test(hashHex) || hashHex.length % 2 !== 0) return false

  try {
    const salt = Buffer.from(saltHex, 'hex')
    const expected = Buffer.from(hashHex, 'hex')
    if (!salt.length || expected.length < 16 || expected.length > 128) return false
    const actual = scryptSync(password, salt, expected.length, {
      N,
      r,
      p,
      maxmem: Math.max(32 * 1024 * 1024, 256 * N * r * p),
    })
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

/** Create a URL-safe session token with 256 bits of entropy. */
export function newSessionToken() {
  return randomBytes(32).toString('base64url')
}

/** Store tokens hashed with SHA-256 so a database leak cannot replay them. */
export function hashToken(token) {
  return createHash('sha256').update(String(token)).digest('hex')
}

/** Constant-time comparison for secrets, including strings of different lengths. */
export function safeEqual(left, right) {
  if (left === undefined || left === null || right === undefined || right === null) return false
  const toBuffer = (value) => (Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8'))
  const a = createHash('sha256').update(toBuffer(left)).digest()
  const b = createHash('sha256').update(toBuffer(right)).digest()
  return timingSafeEqual(a, b)
}
