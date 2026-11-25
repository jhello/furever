import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import {
  consumeResetToken,
  createAccount,
  createResetToken,
  createSession,
  findAccount,
  hashPassword,
  isValidEmail,
  isValidPassword,
  listAccounts,
  normalizeEmail,
  publicAccount,
  resetTokens,
  sessions,
  updateAccount,
  verifyPassword,
} from './store.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT || 3000)

app.use(cors())
app.use(express.json({ limit: '16kb' }))

function authRequired(req, res, next) {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const email = sessions.get(token)
  if (!email) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: '登录状态无效，请重新登录' })
  }
  req.accountEmail = email
  req.sessionToken = token
  next()
}

function handleError(res, error) {
  const messages = {
    EMAIL_EXISTS: '该邮箱已经注册',
    ACCOUNT_NOT_FOUND: '账户不存在',
    EMAIL_IN_USE: '该邮箱已被其他账户使用',
  }
  res.status(400).json({ error: error.message, message: messages[error.message] || '操作失败' })
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

app.post('/api/auth/register', (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const password = req.body?.password
  if (!isValidEmail(email)) return res.status(400).json({ message: '请输入有效的邮箱地址' })
  if (!isValidPassword(password)) return res.status(400).json({ message: '密码至少需要 6 位' })
  try {
    createAccount(email, password)
    const token = createSession(email)
    res.status(201).json({ token, email })
  } catch (error) {
    handleError(res, error)
  }
})

app.post('/api/auth/login', (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const password = req.body?.password
  if (!isValidEmail(email)) return res.status(400).json({ message: '请输入有效的邮箱地址' })
  if (typeof password !== 'string') return res.status(400).json({ message: '请输入密码' })
  const account = findAccount(email)
  if (!account || !verifyPassword(password, account.passwordHash)) {
    return res.status(401).json({ message: '邮箱或密码不正确' })
  }
  updateAccount(email, (item) => {
    item.lastLoginAt = new Date().toISOString()
  })
  const token = createSession(email)
  res.json({ token, email })
})

app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ email: req.accountEmail })
})

app.post('/api/auth/logout', authRequired, (req, res) => {
  sessions.delete(req.sessionToken)
  res.json({ ok: true })
})

app.post('/api/auth/forgot-password', (req, res) => {
  const email = normalizeEmail(req.body?.email)
  if (!isValidEmail(email)) return res.status(400).json({ message: '请输入有效的邮箱地址' })
  if (!findAccount(email)) {
    return res.json({ ok: true, resetToken: null, message: '如果该邮箱已注册，重置令牌会显示在这里（开发模式）' })
  }
  const resetToken = createResetToken(email)
  res.json({
    ok: true,
    resetToken,
    expiresAt: new Date(resetTokens.get(resetToken).expiresAt).toISOString(),
    message: '开发模式：重置令牌已返回，请复制到下方完成重置',
  })
})

app.post('/api/auth/reset-password', (req, res) => {
  const token = req.body?.resetToken
  const password = req.body?.newPassword
  if (!isValidPassword(password)) return res.status(400).json({ message: '新密码至少需要 6 位' })
  const entry = consumeResetToken(token)
  if (!entry) return res.status(400).json({ message: '重置令牌无效或已过期' })
  updateAccount(entry.email, (account) => {
    account.passwordHash = hashPassword(password)
  })
  for (const [sessionToken, email] of sessions) {
    if (email === entry.email) sessions.delete(sessionToken)
  }
  res.json({ ok: true })
})

app.post('/api/account/change-email', authRequired, (req, res) => {
  const newEmail = normalizeEmail(req.body?.newEmail)
  const password = req.body?.password
  if (!isValidEmail(newEmail)) return res.status(400).json({ message: '请输入有效的新邮箱地址' })
  const account = findAccount(req.accountEmail)
  if (!account || !verifyPassword(password, account.passwordHash)) {
    return res.status(401).json({ message: '当前密码不正确' })
  }
  if (newEmail === req.accountEmail) return res.status(400).json({ message: '新邮箱不能和当前邮箱相同' })
  if (findAccount(newEmail)) return handleError(res, new Error('EMAIL_IN_USE'))
  updateAccount(req.accountEmail, (item) => {
    item.email = newEmail
  })
  for (const [token, email] of sessions) {
    if (email === req.accountEmail) sessions.set(token, newEmail)
  }
  res.json({ ok: true, email: newEmail })
})

app.post('/api/account/change-password', authRequired, (req, res) => {
  const currentPassword = req.body?.currentPassword
  const newPassword = req.body?.newPassword
  if (!isValidPassword(newPassword)) return res.status(400).json({ message: '新密码至少需要 6 位' })
  const account = findAccount(req.accountEmail)
  if (!account || !verifyPassword(currentPassword, account.passwordHash)) {
    return res.status(401).json({ message: '当前密码不正确' })
  }
  updateAccount(req.accountEmail, (item) => {
    item.passwordHash = hashPassword(newPassword)
  })
  res.json({ ok: true })
})

app.get('/api/dashboard/data', (_req, res) => {
  const accounts = listAccounts().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json({
    ok: true,
    stats: {
      totalAccounts: accounts.length,
      activeSessions: sessions.size,
      pendingResets: resetTokens.size,
    },
    accounts: accounts.map(publicAccount),
  })
})

app.use(express.static(path.join(__dirname, '..', 'public')))
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
  }
  next()
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: '服务器内部错误' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FurEver 服务端已启动：http://localhost:${PORT}`)
  console.log(`看板地址：http://localhost:${PORT}/`)
})
