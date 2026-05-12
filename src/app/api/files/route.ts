import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { readFileAt } from '@/lib/storage'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

const ALLOWED_BUCKETS = new Set(['covers', 'pdfs'])

const MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

// Token validation cache — avoids DB query on every range request
const tokenCache = new Map<string, { expiresAt: number; cachedAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5분

async function isTokenValid(tokenId: string): Promise<boolean> {
  const now = Date.now()
  const cached = tokenCache.get(tokenId)

  if (cached && now - cached.cachedAt < CACHE_TTL) {
    return cached.expiresAt > now
  }

  const { data } = await supabaseAdmin
    .from('qr_tokens')
    .select('is_active, expires_at')
    .eq('id', tokenId)
    .single()

  if (!data?.is_active) return false

  const expiresAt = new Date(data.expires_at).getTime()
  tokenCache.set(tokenId, { expiresAt, cachedAt: now })
  return expiresAt > now
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const bucket = searchParams.get('bucket')
  const filePath = searchParams.get('path')
  const token = searchParams.get('token')

  if (!bucket || !ALLOWED_BUCKETS.has(bucket) || !filePath) {
    return new NextResponse('Not found', { status: 404 })
  }

  const authed = await isAuthenticated()
  if (!authed) {
    if (!token || !(await isTokenValid(token))) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  let file: { path: string; size: number }
  try {
    file = await readFileAt(bucket, filePath)
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }

  const contentType = MIME[path.extname(file.path).toLowerCase()] ?? 'application/octet-stream'
  const range = req.headers.get('range')

  if (range) {
    const match = range.match(/bytes=(\d+)-(\d*)/)
    if (match) {
      const start = parseInt(match[1], 10)
      const end = match[2] ? parseInt(match[2], 10) : file.size - 1
      const nodeStream = fs.createReadStream(file.path, { start, end })
      const webStream = Readable.toWeb(nodeStream) as ReadableStream
      return new NextResponse(webStream, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Range': `bytes ${start}-${end}/${file.size}`,
          'Content-Length': String(end - start + 1),
          'Accept-Ranges': 'bytes',
        },
      })
    }
  }

  const nodeStream = fs.createReadStream(file.path)
  const webStream = Readable.toWeb(nodeStream) as ReadableStream
  return new NextResponse(webStream, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(file.size),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
