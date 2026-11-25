import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const srcDir = path.dirname(fileURLToPath(import.meta.url))
export const serverDir = path.resolve(srcDir, '..')
export const projectDir = path.resolve(serverDir, '..')

function resolveFromProject(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback
  return path.isAbsolute(value) ? path.normalize(value) : path.resolve(projectDir, value)
}

function parsePort(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback
  const port = Number(value)
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('FUREVER_PORT 必须是 0 到 65535 之间的整数')
  }
  return port
}

function parsePositiveNumber(value, fallback, name) {
  if (value === undefined || value === null || value === '') return fallback
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${name} 必须是正数`)
  }
  return number
}

function loadAdminToken(env, dataDir) {
  const explicit = env.FUREVER_ADMIN_TOKEN
  if (typeof explicit === 'string' && explicit.trim()) return explicit.trim()

  fs.mkdirSync(dataDir, { recursive: true })
  const tokenPath = path.join(dataDir, 'admin-token')

  const readExisting = () => {
    const value = fs.readFileSync(tokenPath, 'utf8').trim()
    if (!value) throw new Error('管理员令牌文件为空，请删除后重试')
    fs.chmodSync(tokenPath, 0o600)
    return value
  }

  try {
    return readExisting()
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  const token = randomBytes(18).toString('base64url')
  try {
    const fd = fs.openSync(tokenPath, 'wx', 0o600)
    try {
      fs.writeFileSync(fd, `${token}\n`)
    } finally {
      fs.closeSync(fd)
    }
    fs.chmodSync(tokenPath, 0o600)
    return token
  } catch (error) {
    if (error.code === 'EEXIST') return readExisting()
    throw error
  }
}

/** Return local and LAN base URLs for the given listening port. */
export function getLanUrls(port = 3000) {
  const urls = [`http://localhost:${port}/`]
  for (const infos of Object.values(os.networkInterfaces())) {
    for (const info of infos || []) {
      if (info.family === 'IPv4' && !info.internal) {
        urls.push(`http://${info.address}:${port}/`)
      }
    }
  }
  return [...new Set(urls)]
}

export function loadConfig(env = process.env) {
  const dataDir = resolveFromProject(env.FUREVER_DATA_DIR, path.join(projectDir, 'data'))
  const webDir = resolveFromProject(env.FUREVER_WEB_DIR, path.join(projectDir, 'web'))
  const dashboardDir = resolveFromProject(
    env.FUREVER_DASHBOARD_DIR,
    path.join(serverDir, 'public', 'dashboard'),
  )
  const sessionDays = parsePositiveNumber(env.FUREVER_SESSION_DAYS, 30, 'FUREVER_SESSION_DAYS')
  const resetMinutes = parsePositiveNumber(env.FUREVER_RESET_MINUTES, 1440, 'FUREVER_RESET_MINUTES')

  fs.mkdirSync(dataDir, { recursive: true })
  const dbPath = resolveFromProject(env.FUREVER_DB_PATH, path.join(dataDir, 'furever.db'))
  const adminToken = loadAdminToken(env, dataDir)

  return {
    host: env.FUREVER_HOST || env.HOST || '0.0.0.0',
    port: parsePort(env.FUREVER_PORT ?? env.PORT, 3000),
    dataDir,
    dbPath,
    webDir,
    dashboardDir,
    adminToken,
    adminTokenPath: path.join(dataDir, 'admin-token'),
    sessionDays,
    resetMinutes,
    sessionMs: sessionDays * 24 * 60 * 60 * 1000,
    resetMs: resetMinutes * 60 * 1000,
    projectDir,
    serverDir,
  }
}
