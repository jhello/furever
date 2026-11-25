const TOKEN_KEY = 'furever.adminToken'
const POLL_INTERVAL = 5000

const byId = (id) => document.getElementById(id)
const ui = {
  gate: byId('gate'),
  gateMessage: byId('gate-message'),
  tokenForm: byId('token-form'),
  token: byId('token'),
  logout: byId('logout'),
  dashboard: byId('dashboard'),
  statUsers: byId('stat-users'),
  statSessions: byId('stat-sessions'),
  statResets: byId('stat-resets'),
  accounts: byId('accounts'),
  accountCount: byId('account-count'),
  requests: byId('requests'),
  serverInfo: byId('server-info'),
  status: byId('status'),
}

let pollTimer = null
let refreshing = false

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => HTML_ESCAPES[character])
}

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function saveToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* Storage may be disabled; the token still works for this page session. */
  }
}

function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* Ignore storage errors. */
  }
}

function setStatus(message, isError = false) {
  ui.status.textContent = message || ''
  ui.status.classList.toggle('error-text', Boolean(isError))
}

function showGate(message = '') {
  ui.gate.hidden = false
  ui.dashboard.hidden = true
  ui.logout.hidden = true
  ui.gateMessage.textContent = message
}

function showDashboard() {
  ui.gate.hidden = true
  ui.dashboard.hidden = false
  ui.logout.hidden = false
}

function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('zh-CN', { hour12: false })
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') return value.toLocaleString('zh-CN')
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function renderAccounts(users) {
  ui.accountCount.textContent = `共 ${users.length} 个`
  if (!users.length) {
    ui.accounts.innerHTML = '<p class="empty">暂无账户</p>'
    return
  }
  const rows = users
    .map(
      (user) => `<tr>
        <td>${escapeHtml(user.id)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(formatTime(user.created_at))}</td>
        <td>${escapeHtml(formatTime(user.last_login_at))}</td>
      </tr>`,
    )
    .join('')
  ui.accounts.innerHTML = `<div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>邮箱</th><th>注册时间</th><th>最近登录</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`
}

function renderRequests(requests) {
  if (!requests.length) {
    ui.requests.innerHTML = '<tr><td colspan="5" class="empty">暂无请求</td></tr>'
    return
  }
  ui.requests.innerHTML = [...requests]
    .reverse()
    .slice(0, 50)
    .map(
      (item) => `<tr>
        <td>${escapeHtml(formatTime(item.time))}</td>
        <td>${escapeHtml(item.method)}</td>
        <td class="path">${escapeHtml(item.path)}</td>
        <td class="${Number(item.status) >= 400 ? 'status-bad' : 'status-ok'}">${escapeHtml(item.status)}</td>
        <td>${escapeHtml(item.durationMs)} ms</td>
      </tr>`,
    )
    .join('')
}

const SERVER_LABELS = {
  hostname: '主机名',
  platform: '系统',
  arch: '架构',
  node: 'Node 版本',
  pid: '进程 ID',
  uptimeSeconds: '运行时长（秒）',
  memoryRssBytes: '内存占用（字节）',
  host: '监听地址',
  port: '监听端口',
  dbPath: '数据库路径',
  dbFileSize: '数据库大小（字节）',
  sessionDays: '会话有效期（天）',
  resetMinutes: '重置有效期（分钟）',
  dashboardUrl: '看板地址',
  appUrl: '应用地址',
}

function renderServerInfo(server) {
  const entries = Object.entries(server || {})
  if (!entries.length) {
    ui.serverInfo.innerHTML = '<p class="empty">暂无信息</p>'
    return
  }
  ui.serverInfo.innerHTML = entries
    .map(
      ([key, value]) => `<div class="info-row">
        <dt>${escapeHtml(SERVER_LABELS[key] || key)}</dt>
        <dd>${escapeHtml(formatValue(value))}</dd>
      </div>`,
    )
    .join('')
}

function render(data) {
  const stats = data.stats || {}
  ui.statUsers.textContent = String(stats.users ?? 0)
  ui.statSessions.textContent = String(stats.sessions ?? 0)
  ui.statResets.textContent = String(stats.resets ?? 0)
  renderAccounts(Array.isArray(data.users) ? data.users : [])
  renderRequests(Array.isArray(data.requests) ? data.requests : [])
  renderServerInfo(data.server)
}

async function refresh() {
  const token = readToken()
  if (!token) {
    stopPolling()
    showGate()
    return
  }
  if (refreshing) return
  refreshing = true
  try {
    const response = await fetch('/api/dashboard/data', {
      headers: { 'X-Admin-Token': token },
      cache: 'no-store',
    })
    if (response.status === 401 || response.status === 403) {
      clearToken()
      stopPolling()
      showGate('管理员令牌无效，请重新输入')
      setStatus('')
      return
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    render(data)
    setStatus(`已更新：${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`)
  } catch (error) {
    setStatus(`加载失败：${error.message}`, true)
  } finally {
    refreshing = false
  }
}

function startPolling() {
  stopPolling()
  pollTimer = window.setInterval(() => {
    if (!document.hidden) refresh()
  }, POLL_INTERVAL)
}

function stopPolling() {
  if (pollTimer !== null) {
    window.clearInterval(pollTimer)
    pollTimer = null
  }
}

ui.tokenForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const token = ui.token.value.trim()
  if (!token) {
    ui.gateMessage.textContent = '请输入管理员令牌'
    return
  }
  saveToken(token)
  showDashboard()
  refresh()
  startPolling()
})

ui.logout.addEventListener('click', () => {
  clearToken()
  stopPolling()
  ui.token.value = ''
  ui.gateMessage.textContent = ''
  showGate()
  setStatus('')
})

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && readToken()) refresh()
})

if (readToken()) {
  showDashboard()
  refresh()
  startPolling()
} else {
  showGate()
}
