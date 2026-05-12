import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/session'

const attempts = new Map<string, { count: number; resetAt: number }>()

function getRateLimit(ip: string) {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    return { count: 0, blocked: false }
  }
  return { count: entry.count, blocked: entry.count >= 5 }
}

function incrementAttempt(ip: string) {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
  } else {
    entry.count++
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { blocked } = getRateLimit(ip)

  if (blocked) {
    return NextResponse.json({ error: '잠시 후 다시 시도해주세요.' }, { status: 429 })
  }

  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    incrementAttempt(ip)
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  await createSession()
  return NextResponse.json({ ok: true })
}
