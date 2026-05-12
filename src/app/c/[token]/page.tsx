import { supabaseAdmin, getSignedUrl } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import BookShelf from './BookShelf'

export default async function ClassPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: tokenData, error } = await supabaseAdmin
    .from('qr_tokens')
    .select('class_id, expires_at, is_active, book_id, classes(name, description)')
    .eq('id', token)
    .single()

  if (error || !tokenData?.is_active || new Date(tokenData.expires_at) < new Date()) {
    notFound()
  }

  if (tokenData.book_id) {
    redirect(`/c/${token}/book/${tokenData.book_id}`)
  }

  const { data: books } = await supabaseAdmin
    .from('books')
    .select('id, title, author, description, cover_image_path')
    .eq('class_id', tokenData.class_id)
    .order('created_at', { ascending: true })

  const booksWithCovers = await Promise.all(
    (books ?? []).map(async (book) => {
      const coverUrl = await getSignedUrl('covers', book.cover_image_path, 3600).catch(() => null)
      return { ...book, cover_url: coverUrl }
    })
  )

  const cls = tokenData.classes as unknown as { name: string; description: string | null }

  return (
    <main className="bookshelf-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-stone-800">{cls.name}</h1>
          {cls.description && <p className="text-stone-400 mt-2">{cls.description}</p>}
          <p className="text-xs text-stone-300 mt-3">
            {new Date(tokenData.expires_at).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}까지 열람 가능
          </p>
        </div>
        <BookShelf books={booksWithCovers} token={token} />
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { data } = await supabaseAdmin
    .from('qr_tokens')
    .select('classes(name)')
    .eq('id', token)
    .single()
  const cls = (data?.classes as unknown) as { name: string } | null
  return { title: cls?.name ? `${cls.name} · 책 갤러리` : '책 갤러리' }
}
