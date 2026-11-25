import { getLanUrls, loadConfig } from './config.js'
import { startServer } from './app.js'

const config = loadConfig()
const app = await startServer(config)
const address = app.server.address()
const port = address && typeof address === 'object' ? address.port : config.port
const urls = getLanUrls(port)
const withPath = (suffix) => urls.map((url) => `${url.replace(/\/$/, '')}${suffix}`)

console.log('========================================')
console.log(' FurEver 服务端已启动')
console.log(` 监听地址：${config.host}:${port}`)
console.log(` 管理看板：${withPath('/').join('  ')}`)
console.log(` 应用页面：${withPath('/app/').join('  ')}`)
console.log(` 健康检查：${withPath('/api/health').join('  ')}`)
console.log(` 管理员令牌：${config.adminToken}`)
console.log(` 数据库路径：${config.dbPath}`)
if (urls.length > 1) console.log(` 局域网地址：${urls.slice(1).join('  ')}`)
console.log('========================================')

let shuttingDown = false
async function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  const forceExit = setTimeout(() => {
    console.error('关闭超时，强制退出')
    process.exit(1)
  }, 5000)
  try {
    await app.close()
    clearTimeout(forceExit)
    console.log('FurEver 服务端已关闭')
    process.exit(0)
  } catch (error) {
    clearTimeout(forceExit)
    console.error('关闭服务端失败：', error)
    process.exit(1)
  }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
