import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data: book, error: fetchError } = await supabaseAdmin
    .from('books')
    .select('cover_image_path, pdf_path')
    .eq('id', id)
    .single()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  await Promise.all([
    supabaseAdmin.storage.from('covers').remove([book.cover_image_path]),
    supabaseAdmin.storage.from('pdfs').remove([book.pdf_path]),
  ])

  const { error } = await supabaseAdmin.from('books').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
