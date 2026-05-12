import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { getFileUrl } from '@/lib/storage'
import Link from 'next/link'
import BookUploadForm from './BookUploadForm'
import BookDeleteButton from './BookDeleteButton'

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) redirect('/admin')

  const { id } = await params

  const { data: cls } = await supabaseAdmin
    .from('classes')
    .select('*')
    .eq('id', id)
    .single()

  if (!cls) redirect('/admin/dashboard')

  const { data: books } = await supabaseAdmin
    .from('books')
    .select('*')
    .eq('class_id', id)
    .order('created_at', { ascending: true })

  const booksWithCovers = (books ?? []).map((book) => ({
    ...book,
    cover_url: getFileUrl('covers', book.cover_image_path),
  }))

  return (
    <main className="bookshelf-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin/dashboard" className="text-stone-400 text-sm hover:text-stone-600">
            ← 목록으로
          </Link>
        </div>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">{cls.name}</h1>
            {cls.description && <p className="text-stone-400 text-sm mt-1">{cls.description}</p>}
          </div>
          <Link
            href={`/admin/dashboard/classes/${id}/qr`}
            className="bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors"
          >
            QR 코드 생성
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-stone-700 mb-4">책 업로드</h2>
            <BookUploadForm classId={id} />
          </div>

          <div>
            <h2 className="font-semibold text-stone-700 mb-4">
              전시된 책 <span className="text-stone-400 font-normal">({booksWithCovers.length}권)</span>
            </h2>
            {!booksWithCovers.length ? (
              <div className="bg-white rounded-2xl p-10 text-center text-stone-400">
                <p>아직 업로드된 책이 없습니다.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {booksWithCovers.map((book) => (
                  <div key={book.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4 items-center">
                    <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden shadow bg-stone-100">
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 truncate">{book.title}</p>
                      <p className="text-stone-400 text-sm">{book.author}</p>
                    </div>
                    <BookDeleteButton bookId={book.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
