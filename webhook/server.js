const http = require('http')
const { execSync } = require('child_process')

const PORT = process.env.WEBHOOK_PORT ?? 9000
const SECRET = process.env.DEPLOY_WEBHOOK_SECRET
const PROJECT_DIR = process.env.PROJECT_DIR ?? '/opt/book-gallery'

if (!SECRET) {
  console.error('DEPLOY_WEBHOOK_SECRET 환경변수가 필요합니다.')
  process.exit(1)
}

let deploying = false

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405)
    res.end()
    return
  }

  const clientSecret = req.headers['x-webhook-secret']
  if (clientSecret !== SECRET) {
    console.warn(`[${new Date().toISOString()}] 인증 실패 - 잘못된 시크릿`)
    res.writeHead(401)
    res.end()
    return
  }

  if (deploying) {
    console.log(`[${new Date().toISOString()}] 이미 배포 중 - 요청 무시`)
    res.writeHead(202)
    res.end('deploying')
    return
  }

  res.writeHead(200)
  res.end('ok')

  deploying = true
  console.log(`[${new Date().toISOString()}] 배포 시작`)

  try {
    execSync('docker compose pull', { cwd: PROJECT_DIR, stdio: 'inherit' })
    execSync('docker compose up -d', { cwd: PROJECT_DIR, stdio: 'inherit' })
    console.log(`[${new Date().toISOString()}] 배포 완료`)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] 배포 실패:`, err.message)
  } finally {
    deploying = false
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`웹훅 서버 실행 중 - 포트 ${PORT} (localhost only)`)
})
