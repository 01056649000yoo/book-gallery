import { NextRequest, NextResponse } from 'next/server'

const SESSION_KEY = 'admin_session'

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAuthenticated = req.cookies.get(SESSION_KEY)?.value === 'authenticated'

  // /api/admin/* 보호 (로그인 엔드포인트 제외)
  if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login') {
    if (!isAuthenticated) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }
  }

  // /admin/dashboard/* 보호
  if (pathname.startsWith('/admin/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  // 이미 로그인한 상태에서 /admin 로그인 페이지 접근 시 대시보드로 이동
  if (pathname === '/admin' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
