import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getSignedUrl } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const bookId = searchParams.get('bookId')

  if (!token || !bookId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Validate token
  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from('qr_tokens')
    .select('class_id, expires_at, is_active')
    .eq('id', token)
    .single()

  if (tokenError || !tokenData?.is_active || new Date(tokenData.expires_at) < new Date()) {
    return NextResponse.json({ error: '유효하지 않은 접근입니다.' }, { status: 403 })
  }

  // Ensure book belongs to the token's class
  const { data: book, error: bookError } = await supabaseAdmin
    .from('books')
    .select('pdf_path, cover_image_path')
    .eq('id', bookId)
    .eq('class_id', tokenData.class_id)
    .single()

  if (bookError || !book) {
    return NextResponse.json({ error: '책을 찾을 수 없습니다.' }, { status: 404 })
  }

  const [pdfUrl, coverUrl] = await Promise.all([
    getSignedUrl('pdfs', book.pdf_path, 3600),
    getSignedUrl('covers', book.cover_image_path, 3600),
  ])

  return NextResponse.json({ pdfUrl, coverUrl })
}
