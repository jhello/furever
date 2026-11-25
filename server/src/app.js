import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import {
  hashPassword,
  hashToken,
  newSessionToken,
  safeEqual,
  verifyPassword,
} from './auth.js'
import { createDb, fileSize } from './db.js'

const MAX_BODY_BYTES = 1024 * 1024
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIME_TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json; charset=utf-8',
})

const nowIso = () => new Date().toISOString()

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

export function sendEmpty(res, status = 204) {
  res.writeHead(status)
  res.end()
}

export async function readJson(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new HttpError(413, '请求体过大')
    chunks.push(buffer)
  }
  if (!size) return {}
  let value
  try {
    value = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new HttpError(400, '请求体格式无效')
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, '请求体格式无效')
  }
  return value
}

/** Join a URL path to a base directory without allowing traversal or absolute paths. */
export function safeJoin(base, urlPath) {
  let decoded
  try {
    decoded = decodeURIComponent(String(urlPath || ''))
  } catch {
    throw new HttpError(400, '请求路径无效')
  }
  decoded = decoded.split(/[?#]/, 1)[0].replace(/\\/g, '/')
  if (decoded.includes('\0')) throw new HttpError(400, '请求路径无效')

  const root = path.resolve(base)
  const segments = []
  for (const segment of decoded.split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..') throw new HttpError(403, '禁止访问')
    if (/^[a-zA-Z]:/.test(segment)) throw new HttpError(403, '禁止访问')
    segments.push(segment)
  }
  const full = path.resolve(root, ...segments)
  if (full !== root && !full.startsWith(`${root}${path.sep}`)) {
    throw new HttpError(403, '禁止访问')
  }
  return full
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function validEmail(value) {
  return EMAIL_PATTERN.test(value)
}

function validPassword(value) {
  return typeof value === 'string' && value.length >= 6 && value.length <= 128
}

function passwordLengthError(value, label = '密码') {
  if (typeof value !== 'string' || value.length < 6) {
    return new HttpError(400, `${label}至少需要 6 位`)
  }
  if (value.length > 128) return new HttpError(400, `${label}不能超过 128 位`)
  return null
}

function isUniqueError(error) {
  return (
    typeof error?.code === 'string' &&
    (error.code.includes('CONSTRAINT_UNIQUE') || error.code.includes('CONSTRAINT_PRIMARYKEY'))
  ) || /UNIQUE constraint failed/i.test(String(error?.message || ''))
}

async function sendFile(req, res, filePath, cacheControl = 'no-cache') {
  let stats
  try {
    stats = await fs.promises.stat(filePath)
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') throw new HttpError(404, '文件不存在')
    throw error
  }
  if (!stats.isFile()) throw new HttpError(404, '文件不存在')

  const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stats.size,
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
  })
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
    stream.once('error', reject)
    stream.once('end', resolve)
    stream.pipe(res)
  })
}

export function createApp(config, options = {}) {
  const db = options.db || createDb(config)
  const requests = []
  const metrics = { total: 0, errors: 0, byStatus: {} }
  const routes = []
  const logRequests = options.logRequests !== false
  let cleanupTimer = null
  let closing = null

  const addRoute = (method, pattern, handler) => {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(`^${pattern}$`)
    routes.push({ method, regex, handler })
  }

  function issueSession(userId) {
    const token = newSessionToken()
    const createdAt = Date.now()
    db.createSession(
      hashToken(token),
      userId,
      new Date(createdAt).toISOString(),
      new Date(createdAt + config.sessionMs).toISOString(),
    )
    return token
  }

  function authenticate(req) {
    const header = req.headers.authorization
    const raw = Array.isArray(header) ? header[0] : header
    const match = typeof raw === 'string' && /^Bearer\s+(.+)$/i.exec(raw)
    if (!match) throw new HttpError(401, '登录状态无效，请重新登录')

    const tokenHash = hashToken(match[1].trim())
    const session = db.findSession(tokenHash)
    if (!session) throw new HttpError(401, '登录状态无效，请重新登录')

    const seen = nowIso()
    db.touchSession(tokenHash, seen, new Date(Date.now() + config.sessionMs).toISOString())
    db.touchSeen(session.user_id, seen)
    const user = db.findUserById(session.user_id)
    if (!user) throw new HttpError(401, '登录状态无效，请重新登录')
    return { tokenHash, session, user }
  }

  function requireAdmin(req) {
    const header = req.headers['x-admin-token']
    const token = Array.isArray(header) ? header[0] : header
    if (!token || !safeEqual(token, config.adminToken)) {
      throw new HttpError(401, '管理员令牌无效')
    }
  }

  function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token')
    res.setHeader('Access-Control-Max-Age', '86400')
  }

  // ---- API routes -------------------------------------------------------

  addRoute('GET', '/api/health', () => ({ ok: true, time: nowIso() }))

  addRoute('POST', '/api/auth/register', async ({ body }) => {
    const email = normalizeEmail(body.email)
    if (!validEmail(email)) throw new HttpError(400, '请输入有效的邮箱地址')
    const passwordError = passwordLengthError(body.password)
    if (passwordError) throw passwordError

    let user
    try {
      user = db.createUser(email, hashPassword(body.password))
    } catch (error) {
      if (isUniqueError(error)) throw new HttpError(409, '邮箱已注册')
      throw error
    }
    return { status: 201, body: { token: issueSession(user.id), email } }
  })

  addRoute('POST', '/api/auth/login', async ({ body }) => {
    const email = normalizeEmail(body.email)
    const user = validEmail(email) ? db.findUserByEmail(email) : null
    if (!user || typeof body.password !== 'string' || !verifyPassword(body.password, user.password_hash)) {
      throw new HttpError(401, '邮箱或密码不正确')
    }
    db.touchLogin(user.id)
    return { body: { token: issueSession(user.id), email: user.email } }
  })

  addRoute('GET', '/api/auth/me', ({ req, res }) => {
    const { user } = authenticate(req)
    return { body: { email: user.email } }
  })

  addRoute('POST', '/api/auth/logout', ({ req }) => {
    const { tokenHash } = authenticate(req)
    db.deleteSession(tokenHash)
    return { body: { ok: true } }
  })

  addRoute('POST', '/api/auth/forgot-password', ({ body }) => {
    const email = normalizeEmail(body.email)
    const user = validEmail(email) ? db.findUserByEmail(email) : null
    if (!user) {
      return {
        body: {
          ok: true,
          message: '如果该邮箱已注册，重置令牌会显示在这里（开发模式）',
          resetToken: null,
        },
      }
    }
    const token = newSessionToken()
    const createdAt = Date.now()
    db.createPasswordReset(
      hashToken(token),
      user.id,
      new Date(createdAt).toISOString(),
      new Date(createdAt + config.resetMs).toISOString(),
    )
    return {
      body: {
        ok: true,
        message: '开发模式：重置令牌已返回，请复制到下方完成重置',
        resetToken: token,
      },
    }
  })

  addRoute('POST', '/api/auth/reset-password', ({ body }) => {
    const passwordError = passwordLengthError(body.password, '新密码')
    if (passwordError) throw passwordError
    if (typeof body.token !== 'string' || !body.token.trim()) {
      throw new HttpError(400, '重置链接无效或已过期')
    }
    const reset = db.consumePasswordReset(hashToken(body.token.trim()))
    if (!reset) throw new HttpError(400, '重置链接无效或已过期')
    db.setPassword(reset.user_id, hashPassword(body.password))
    db.deleteSessionsForUser(reset.user_id)
    return { body: { ok: true } }
  })

  addRoute('PUT', '/api/account/email', ({ req, body }) => {
    const auth = authenticate(req)
    const email = normalizeEmail(body.email)
    if (!validEmail(email)) throw new HttpError(400, '请输入有效的新邮箱地址')
    if (typeof body.password !== 'string' || !verifyPassword(body.password, auth.user.password_hash)) {
      throw new HttpError(401, '当前密码不正确')
    }
    if (email === auth.user.email_lower) throw new HttpError(400, '新邮箱不能和当前邮箱相同')
    if (db.findUserByEmail(email)) throw new HttpError(409, '邮箱已被注册')
    db.setEmail(auth.user.id, email)
    return { body: { ok: true, email } }
  })

  addRoute('PUT', '/api/account/password', ({ req, body }) => {
    const auth = authenticate(req)
    const passwordError = passwordLengthError(body.newPassword, '新密码')
    if (passwordError) throw passwordError
    if (
      typeof body.currentPassword !== 'string' ||
      !verifyPassword(body.currentPassword, auth.user.password_hash)
    ) {
      throw new HttpError(401, '当前密码不正确')
    }
    db.setPassword(auth.user.id, hashPassword(body.newPassword))
    db.deleteSessionsForUser(auth.user.id, auth.tokenHash)
    return { body: { ok: true } }
  })

  addRoute('GET', '/api/dashboard/data', ({ req }) => {
    requireAdmin(req)
    const address = server.address()
    return {
      body: {
        stats: db.stats(),
        users: db.listUsers().map((user) => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_login_at: user.last_login_at,
        })),
        requests: requests.map((item) => ({ ...item })),
        server: {
          hostname: os.hostname(),
          platform: process.platform,
          arch: process.arch,
          node: process.version,
          pid: process.pid,
          uptimeSeconds: Math.floor(process.uptime()),
          memoryRssBytes: process.memoryUsage().rss,
          host: config.host,
          port: address && typeof address === 'object' ? address.port : config.port,
          dbPath: config.dbPath,
          dbFileSize: fileSize(config.dbPath),
          sessionDays: config.sessionDays,
          resetMinutes: config.resetMinutes,
          dashboardUrl: '/',
          appUrl: '/app/',
        },
      },
    }
  })

  // ---- Static routes ----------------------------------------------------

  const dashboardIndex = path.join(config.dashboardDir, 'index.html')
  const webIndex = path.join(config.webDir, 'index.html')
  const favicon = path.join(config.webDir, 'icon-192.png')

  addRoute('GET', /^\/$/, ({ req, res }) => sendFile(req, res, dashboardIndex))
  addRoute('GET', /^\/dashboard$/, ({ res }) => {
    res.writeHead(302, { Location: '/dashboard/' })
    res.end()
  })
  addRoute('GET', /^\/dashboard\/(.*)$/, ({ req, res, params }) =>
    sendFile(req, res, params[0] ? safeJoin(config.dashboardDir, params[0]) : dashboardIndex),
  )
  addRoute('GET', /^\/app$/, ({ res }) => {
    res.writeHead(302, { Location: '/app/' })
    res.end()
  })
  addRoute('GET', /^\/app\/(.*)$/, ({ req, res, params }) =>
    sendFile(req, res, params[0] ? safeJoin(config.webDir, params[0]) : webIndex),
  )
  addRoute('GET', '/favicon.ico', ({ req, res }) => sendFile(req, res, favicon, 'public, max-age=3600'))

  // ---- Request pipeline -------------------------------------------------

  async function handle(req, res) {
    const startedAt = Date.now()
    let pathname = req.url || '/'
    try {
      pathname = new URL(req.url || '/', 'http://localhost').pathname
    } catch {
      throw new HttpError(400, '请求地址无效')
    }

    let finished = false
    const finalize = (status) => {
      if (finished) return
      finished = true
      const durationMs = Date.now() - startedAt
      metrics.total += 1
      metrics.byStatus[status] = (metrics.byStatus[status] || 0) + 1
      if (status >= 500) metrics.errors += 1
      requests.push({
        time: nowIso(),
        method: req.method || 'GET',
        path: pathname,
        status,
        durationMs,
      })
      if (requests.length > 200) requests.splice(0, requests.length - 200)
      if (logRequests) console.log(`${req.method} ${pathname} ${status} ${durationMs}ms`)
    }
    res.once('finish', () => finalize(res.statusCode))
    res.once('close', () => finalize(res.statusCode))

    if (pathname === '/api' || pathname.startsWith('/api/')) setCors(res)
    if (req.method === 'OPTIONS') return sendEmpty(res, 204)

    try {
      const route = routes.find(
        (item) => item.method === req.method && item.regex.test(pathname),
      )
      if (!route) {
        if (pathname.startsWith('/api/')) throw new HttpError(404, '接口不存在')
        throw new HttpError(404, '页面不存在')
      }
      const match = route.regex.exec(pathname)
      const result = await route.handler({
        req,
        res,
        url: new URL(req.url || '/', 'http://localhost'),
        path: pathname,
        params: match ? match.slice(1) : [],
        body: req.method === 'POST' || req.method === 'PUT' ? await readJson(req) : {},
      })
      if (res.headersSent || res.writableEnded) return
      if (result && typeof result === 'object' && 'status' in result) {
        sendJson(res, result.status, result.body)
      } else if (result && typeof result === 'object' && 'body' in result) {
        sendJson(res, 200, result.body)
      } else if (result !== undefined) {
        sendJson(res, 200, result)
      } else {
        sendEmpty(res, 204)
      }
    } catch (error) {
      if (res.headersSent) {
        res.destroy()
        return
      }
      if (error instanceof HttpError) {
        sendJson(res, error.status, { message: error.message })
      } else {
        console.error('请求处理失败：', error)
        sendJson(res, 500, { message: '服务器内部错误' })
      }
    }
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch((error) => {
      console.error('未捕获的请求错误：', error)
      if (!res.headersSent) sendJson(res, 500, { message: '服务器内部错误' })
      else res.destroy()
    })
  })

  function start() {
    return new Promise((resolve, reject) => {
      if (server.listening) return resolve(app)
      const onError = (error) => {
        server.off('listening', onListening)
        reject(error)
      }
      const onListening = () => {
        server.off('error', onError)
        resolve(app)
      }
      server.once('error', onError)
      server.once('listening', onListening)
      server.listen(config.port, config.host)
    })
  }

  function close() {
    if (closing) return closing
    closing = (async () => {
      if (cleanupTimer) clearInterval(cleanupTimer)
      cleanupTimer = null
      await new Promise((resolve, reject) => {
        if (!server.listening) return resolve()
        server.close((error) => (error ? reject(error) : resolve()))
      })
      db.close()
    })()
    return closing
  }

  // Expired sessions and reset links are removed hourly; the timer must not
  // keep a test process or a short-lived CLI invocation alive.
  cleanupTimer = setInterval(() => {
    try {
      db.deleteExpired()
    } catch (error) {
      console.error('清理过期数据失败：', error)
    }
  }, 60 * 60 * 1000)
  cleanupTimer.unref()
  try {
    db.deleteExpired()
  } catch (error) {
    console.error('清理过期数据失败：', error)
  }

  const app = {
    config,
    db,
    server,
    requests,
    metrics,
    routes,
    handle,
    start,
    close,
    authenticate,
    requireAdmin,
  }
  return app
}

export async function startServer(config, options = {}) {
  const app = createApp(config, options)
  await app.start()
  return app
}
