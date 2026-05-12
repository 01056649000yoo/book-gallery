'use client'

import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  cover_url: string | null
}

export default function BookShelf({ books, token }: { books: Book[]; token: string }) {
  if (!books.length) {
    return (
      <div className="text-center text-stone-400 py-20">
        <p className="text-4xl mb-4">📖</p>
        <p>아직 전시된 책이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/c/${token}/book/${book.id}`}
          className="group flex flex-col items-center"
        >
          <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-md group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300 bg-stone-200">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 text-4xl">
                📗
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </div>
          <div className="mt-3 text-center w-full">
            <p className="font-medium text-stone-800 text-sm leading-snug line-clamp-2">{book.title}</p>
            <p className="text-stone-400 text-xs mt-1">{book.author}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
