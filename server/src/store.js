import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json')

fs.mkdirSync(DATA_DIR, { recursive: true })

/** @type {Array<{email: string, passwordHash: string, createdAt: string, lastLoginAt: string|null}>} */
let accounts = []

try {
  if (fs.existsSync(ACCOUNTS_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'))
    accounts = Array.isArray(parsed) ? parsed : []
  }
} catch (error) {
  console.error('读取账户数据失败，将从空列表开始：', error.message)
  accounts = []
}

function persist() {
  const tempFile = `${ACCOUNTS_FILE}.${process.pid}.tmp`
  fs.writeFileSync(tempFile, JSON.stringify(accounts, null, 2), 'utf8')
  fs.renameSync(tempFile, ACCOUNTS_FILE)
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  try {
    const [salt, expected] = String(stored).split(':')
    if (!salt || !expected) return false
    const actual = crypto.scryptSync(password, salt, 64)
    const expectedBuffer = Buffer.from(expected, 'hex')
    return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer)
  } catch {
    return false
  }
}

export function findAccount(email) {
  const normalized = normalizeEmail(email)
  return accounts.find((account) => account.email === normalized) || null
}

export function listAccounts() {
  return accounts.map((account) => ({ ...account }))
}

export function createAccount(email, password) {
  const normalized = normalizeEmail(email)
  if (findAccount(normalized)) throw new Error('EMAIL_EXISTS')
  const account = {
    email: normalized,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  }
  accounts.push(account)
  persist()
  return { ...account }
}

export function updateAccount(email, updater) {
  const account = findAccount(email)
  if (!account) throw new Error('ACCOUNT_NOT_FOUND')
  updater(account)
  persist()
  return { ...account }
}

export function deleteAccount(email) {
  accounts = accounts.filter((account) => account.email !== normalizeEmail(email))
  persist()
}

export function publicAccount(account) {
  return {
    email: account.email,
    createdAt: account.createdAt,
    lastLoginAt: account.lastLoginAt,
  }
}

/** 会话和重置令牌只保存在内存中，重启服务后失效。 */
export const sessions = new Map()
export const resetTokens = new Map()

export function createSession(email) {
  const token = crypto.randomBytes(32).toString('hex')
  sessions.set(token, normalizeEmail(email))
  return token
}

export function createResetToken(email) {
  const token = crypto.randomBytes(24).toString('hex')
  resetTokens.set(token, {
    email: normalizeEmail(email),
    expiresAt: Date.now() + 10 * 60 * 1000,
  })
  return token
}

export function consumeResetToken(token) {
  const entry = resetTokens.get(token)
  if (!entry) return null
  resetTokens.delete(token)
  if (entry.expiresAt < Date.now()) return null
  return entry
}
