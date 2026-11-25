const totalAccounts = document.getElementById('totalAccounts')
const activeSessions = document.getElementById('activeSessions')
const pendingResets = document.getElementById('pendingResets')
const accountsBody = document.getElementById('accountsBody')
const updatedAt = document.getElementById('updatedAt')
const refresh = document.getElementById('refresh')

function formatTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

async function load() {
  try {
    const response = await fetch('/api/dashboard/data')
    const data = await response.json()
    totalAccounts.textContent = data.stats.totalAccounts
    activeSessions.textContent = data.stats.activeSessions
    pendingResets.textContent = data.stats.pendingResets
    updatedAt.textContent = `更新于 ${formatTime(new Date().toISOString())}`

    if (!data.accounts.length) {
      accountsBody.innerHTML = '<tr><td colspan="3" class="empty">暂无注册账户</td></tr>'
      return
    }

    accountsBody.innerHTML = data.accounts
      .map(
        (account) => `
          <tr>
            <td>${escapeHtml(account.email)}</td>
            <td>${formatTime(account.createdAt)}</td>
            <td>${formatTime(account.lastLoginAt)}</td>
          </tr>
        `,
      )
      .join('')
  } catch (error) {
    accountsBody.innerHTML = `<tr><td colspan="3" class="empty">加载失败：${escapeHtml(error.message)}</td></tr>`
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

refresh.addEventListener('click', load)
load()
