import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) return NextResponse.json({ valid: false }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('qr_tokens')
    .select('class_id, expires_at, is_active, classes(name, description)')
    .eq('id', token)
    .single()

  if (error || !data?.is_active || new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false })
  }

  const books = await supabaseAdmin
    .from('books')
    .select('id, title, author, description, cover_image_path')
    .eq('class_id', data.class_id)
    .order('created_at', { ascending: true })

  // Generate signed URLs for covers
  const booksWithCovers = await Promise.all(
    (books.data ?? []).map(async (book) => {
      const { data: signed } = await supabaseAdmin.storage
        .from('covers')
        .createSignedUrl(book.cover_image_path, 3600)
      return { ...book, cover_url: signed?.signedUrl ?? null }
    })
  )

  return NextResponse.json({
    valid: true,
    class: data.classes,
    books: booksWithCovers,
    expires_at: data.expires_at,
  })
}
