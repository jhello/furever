import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { after, before, test } from 'node:test'

import { startServer } from '../src/app.js'
import { loadConfig } from '../src/config.js'

const tempRoot = fs.existsSync('/tmp/opencode') ? '/tmp/opencode' : os.tmpdir()
const dataDir = fs.mkdtempSync(path.join(tempRoot, 'furever-api-'))
const config = loadConfig({
  ...process.env,
  FUREVER_HOST: '127.0.0.1',
  FUREVER_PORT: '0',
  PORT: '0',
  FUREVER_DATA_DIR: dataDir,
  FUREVER_ADMIN_TOKEN: 'test-admin-token',
})

let app
let baseUrl
let counter = 0
const emailFor = (name) => `${name}-${Date.now()}-${counter++}@example.com`

before(async () => {
  app = await startServer(config, { logRequests: false })
  const address = app.server.address()
  baseUrl = `http://127.0.0.1:${address.port}`
})

after(async () => {
  if (app) await app.close()
  fs.rmSync(dataDir, { recursive: true, force: true })
})

async function api(pathname, { method = 'GET', body, token, adminToken } = {}) {
  const headers = {}
  if (body !== undefined) headers['content-type'] = 'application/json'
  if (token) headers.authorization = `Bearer ${token}`
  if (adminToken) headers['x-admin-token'] = adminToken
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  let json = null
  try {
    json = await response.json()
  } catch {
    /* Empty or non-JSON response. */
  }
  return { status: response.status, body: json }
}

test('health check', async () => {
  const response = await api('/api/health')
  assert.equal(response.status, 200)
  assert.equal(response.body.ok, true)
  assert.equal(typeof response.body.time, 'string')
})

test('register, me and logout', async () => {
  const email = emailFor('register')
  const registered = await api('/api/auth/register', {
    method: 'POST',
    body: { email, password: 'secret123', locale: 'zh-CN' },
  })
  assert.equal(registered.status, 201)
  assert.equal(registered.body.email, email)
  assert.equal(typeof registered.body.token, 'string')

  const me = await api('/api/auth/me', { token: registered.body.token })
  assert.equal(me.status, 200)
  assert.equal(me.body.email, email)

  const logout = await api('/api/auth/logout', { method: 'POST', token: registered.body.token })
  assert.deepEqual(logout.body, { ok: true })

  const afterLogout = await api('/api/auth/me', { token: registered.body.token })
  assert.equal(afterLogout.status, 401)

  const duplicate = await api('/api/auth/register', {
    method: 'POST',
    body: { email, password: 'secret123' },
  })
  assert.equal(duplicate.status, 409)
  assert.equal(duplicate.body.message, '邮箱已注册')
})

test('login and validation messages', async () => {
  const email = emailFor('login')
  const registered = await api('/api/auth/register', {
    method: 'POST',
    body: { email, password: 'secret123' },
  })
  assert.equal(registered.status, 201)

  const invalid = await api('/api/auth/login', {
    method: 'POST',
    body: { email, password: 'wrong-password' },
  })
  assert.equal(invalid.status, 401)
  assert.equal(invalid.body.message, '邮箱或密码不正确')

  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: email.toUpperCase(), password: 'secret123' },
  })
  assert.equal(login.status, 200)
  assert.equal(login.body.email, email)

  const badEmail = await api('/api/auth/register', {
    method: 'POST',
    body: { email: 'not-an-email', password: 'secret123' },
  })
  assert.equal(badEmail.status, 400)
  assert.equal(badEmail.body.message, '请输入有效的邮箱地址')

  const shortPassword = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailFor('short'), password: '12345' },
  })
  assert.equal(shortPassword.status, 400)
  assert.equal(shortPassword.body.message, '密码至少需要 6 位')
})

test('forgot password and reset invalidates sessions', async () => {
  const email = emailFor('reset')
  const registered = await api('/api/auth/register', {
    method: 'POST',
    body: { email, password: 'old-secret' },
  })
  assert.equal(registered.status, 201)

  const forgot = await api('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
  })
  assert.equal(forgot.status, 200)
  assert.equal(forgot.body.ok, true)
  assert.equal(typeof forgot.body.resetToken, 'string')

  const reset = await api('/api/auth/reset-password', {
    method: 'POST',
    body: { token: forgot.body.resetToken, password: 'new-secret' },
  })
  assert.deepEqual(reset.body, { ok: true })

  const staleSession = await api('/api/auth/me', { token: registered.body.token })
  assert.equal(staleSession.status, 401)

  const reuse = await api('/api/auth/reset-password', {
    method: 'POST',
    body: { token: forgot.body.resetToken, password: 'another-secret' },
  })
  assert.equal(reuse.status, 400)
  assert.equal(reuse.body.message, '重置链接无效或已过期')

  const oldLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { email, password: 'old-secret' },
  })
  assert.equal(oldLogin.status, 401)
  const newLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { email, password: 'new-secret' },
  })
  assert.equal(newLogin.status, 200)

  const missing = await api('/api/auth/forgot-password', {
    method: 'POST',
    body: { email: emailFor('missing') },
  })
  assert.equal(missing.status, 200)
  assert.equal(missing.body.ok, true)
  assert.equal(missing.body.resetToken, null)
})

test('account email and password updates', async () => {
  const email = emailFor('account')
  const registered = await api('/api/auth/register', {
    method: 'POST',
    body: { email, password: 'secret123' },
  })
  const token = registered.body.token

  const sameEmail = await api('/api/account/email', {
    method: 'PUT',
    token,
    body: { email, password: 'secret123' },
  })
  assert.equal(sameEmail.status, 400)
  assert.equal(sameEmail.body.message, '新邮箱不能和当前邮箱相同')

  const newEmail = emailFor('updated')
  const changeEmail = await api('/api/account/email', {
    method: 'PUT',
    token,
    body: { email: newEmail, password: 'secret123' },
  })
  assert.deepEqual(changeEmail.body, { ok: true, email: newEmail })

  const me = await api('/api/auth/me', { token })
  assert.equal(me.body.email, newEmail)

  const wrongPassword = await api('/api/account/password', {
    method: 'PUT',
    token,
    body: { currentPassword: 'nope', newPassword: 'another123' },
  })
  assert.equal(wrongPassword.status, 401)
  assert.equal(wrongPassword.body.message, '当前密码不正确')

  const changePassword = await api('/api/account/password', {
    method: 'PUT',
    token,
    body: { currentPassword: 'secret123', newPassword: 'another123' },
  })
  assert.deepEqual(changePassword.body, { ok: true })

  const stillLoggedIn = await api('/api/auth/me', { token })
  assert.equal(stillLoggedIn.status, 200)

  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: newEmail, password: 'another123' },
  })
  assert.equal(login.status, 200)
})

test('dashboard requires an admin token', async () => {
  const denied = await api('/api/dashboard/data')
  assert.equal(denied.status, 401)
  assert.equal(denied.body.message, '管理员令牌无效')

  const wrong = await api('/api/dashboard/data', { adminToken: 'wrong-token' })
  assert.equal(wrong.status, 401)

  const allowed = await api('/api/dashboard/data', { adminToken: config.adminToken })
  assert.equal(allowed.status, 200)
  assert.equal(typeof allowed.body.stats.users, 'number')
  assert.equal(typeof allowed.body.stats.sessions, 'number')
  assert.equal(typeof allowed.body.stats.resets, 'number')
  assert.ok(Array.isArray(allowed.body.users))
  assert.ok(Array.isArray(allowed.body.requests))
  assert.equal(typeof allowed.body.server.node, 'string')
})
