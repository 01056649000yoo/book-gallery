const http = require('http')
const { execSync } = require('child_process')

const PORT = process.env.WEBHOOK_PORT ?? 9000
const SECRET = process.env.DEPLOY_WEBHOOK_SECRET

if (!SECRET) {
  console.error('DEPLOY_WEBHOOK_SECRET 환경변수가 필요합니다.')
  process.exit(1)
}

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

  console.log(`[${new Date().toISOString()}] 배포 시작`)
  res.writeHead(200)
  res.end('ok')

  try {
    // Mac Mini의 book-gallery 디렉토리 경로로 수정
    const projectDir = process.env.PROJECT_DIR ?? '/opt/book-gallery'
    execSync(
      `cd ${projectDir} && docker compose pull && docker compose up -d`,
      { stdio: 'inherit' }
    )
    console.log(`[${new Date().toISOString()}] 배포 완료`)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] 배포 실패:`, err.message)
  }
})

server.listen(PORT, () => {
  console.log(`웹훅 서버 실행 중 - 포트 ${PORT}`)
})
