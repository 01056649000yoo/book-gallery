import { supabaseAdmin, getSignedUrl } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PDFViewer from './PDFViewer'

export default async function BookPage({
  params,
}: {
  params: Promise<{ token: string; bookId: string }>
}) {
  const { token, bookId } = await params

  const { data: tokenData } = await supabaseAdmin
    .from('qr_tokens')
    .select('class_id, expires_at, is_active')
    .eq('id', token)
    .single()

  if (!tokenData?.is_active || new Date(tokenData.expires_at) < new Date()) {
    notFound()
  }

  const { data: book } = await supabaseAdmin
    .from('books')
    .select('*')
    .eq('id', bookId)
    .eq('class_id', tokenData.class_id)
    .single()

  if (!book) notFound()

  const pdfUrl = await getSignedUrl('pdfs', book.pdf_path, 3600)

  return (
    <main className="min-h-screen bg-stone-900 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-stone-800 text-white">
        <Link
          href={`/c/${token}`}
          className="text-stone-400 hover:text-white text-sm transition-colors"
        >
          ← 책장으로
        </Link>
        <div className="text-center">
          <p className="font-medium text-sm">{book.title}</p>
          <p className="text-stone-400 text-xs">{book.author}</p>
        </div>
        <div className="w-16" />
      </header>
      <PDFViewer pdfUrl={pdfUrl} />
    </main>
  )
}
