import { cookies } from 'next/headers'

const SESSION_KEY = 'admin_session'
const MAX_AGE = 60 * 60 * 8 // 8 hours

export async function createSession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_KEY, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_KEY)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_KEY)?.value === 'authenticated'
}
