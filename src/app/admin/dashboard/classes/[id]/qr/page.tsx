import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import QRManager from './QRManager'

export default async function QRPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) redirect('/admin')

  const { id } = await params

  const { data: cls } = await supabaseAdmin
    .from('classes')
    .select('name')
    .eq('id', id)
    .single()

  if (!cls) redirect('/admin/dashboard')

  const [{ data: tokens }, { data: books }] = await Promise.all([
    supabaseAdmin
      .from('qr_tokens')
      .select('*')
      .eq('class_id', id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('books')
      .select('id, title, author')
      .eq('class_id', id)
      .order('created_at', { ascending: true }),
  ])

  return (
    <main className="bookshelf-bg min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href={`/admin/dashboard/classes/${id}`} className="text-stone-400 text-sm hover:text-stone-600 mb-6 block">
          ← 학급으로
        </Link>
        <h1 className="text-2xl font-bold text-stone-800 mb-1">QR 코드 관리</h1>
        <p className="text-stone-400 text-sm mb-8">{cls.name}</p>
        <QRManager classId={id} tokens={tokens ?? []} books={books ?? []} />
      </div>
    </main>
  )
}
