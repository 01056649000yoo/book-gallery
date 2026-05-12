import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="bookshelf-bg min-h-screen flex flex-col items-center justify-center text-center">
      <p className="text-6xl mb-6">🔒</p>
      <h1 className="text-2xl font-bold text-stone-800 mb-2">접근할 수 없습니다</h1>
      <p className="text-stone-400 mb-8">QR 코드가 유효하지 않거나 만료되었습니다.</p>
      <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 underline underline-offset-4">
        홈으로
      </Link>
    </main>
  )
}
