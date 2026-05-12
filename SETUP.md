# 설정 가이드

## 1. Supabase에 스키마 적용

Supabase 대시보드 → SQL Editor에서 `supabase-schema.sql` 실행

## 2. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 값 채우기:
- `NEXT_PUBLIC_SUPABASE_URL` — 맥미니 IP:8000 (Supabase self-hosted 주소)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `ADMIN_PASSWORD` — 관리자 비밀번호 (8자 이상 권장)
- `SESSION_SECRET` — 32자 이상 랜덤 문자열
- `NEXT_PUBLIC_APP_URL` — 외부 도메인 (예: https://books.your-domain.com)

## 3. GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets → Actions:

| 이름 | 값 |
|------|----|
| `DEPLOY_WEBHOOK_URL` | http://맥미니IP:9000 |
| `DEPLOY_WEBHOOK_SECRET` | 랜덤 시크릿 문자열 |

## 4. Mac Mini에 웹훅 서버 실행

```bash
# 프로젝트 클론
git clone https://github.com/your-username/book-gallery /opt/book-gallery
cd /opt/book-gallery

# 환경변수
export DEPLOY_WEBHOOK_SECRET=위에서-설정한-시크릿
export PROJECT_DIR=/opt/book-gallery

# 웹훅 서버 실행 (백그라운드)
node webhook/server.js &

# 또는 pm2로 관리
npm install -g pm2
pm2 start webhook/server.js --name book-gallery-webhook
pm2 save
pm2 startup
```

## 5. ghcr.io 접근 권한 설정 (Mac Mini)

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u your-github-username --password-stdin
```

## 6. 첫 배포

```bash
# GitHub에 push하면 자동 배포
git push origin main

# 또는 Mac Mini에서 수동 실행
cd /opt/book-gallery
docker compose pull
docker compose up -d
```

## 7. Nginx 리버스 프록시 (선택)

```nginx
server {
    listen 80;
    server_name books.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
