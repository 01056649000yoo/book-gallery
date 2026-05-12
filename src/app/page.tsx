import Link from 'next/link'

export default function Home() {
  return (
    <main className="bookshelf-bg min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-6">📚</div>
        <h1 className="text-4xl font-bold text-stone-800 mb-3">학교 책 갤러리</h1>
        <p className="text-stone-500 mb-8">QR 코드를 스캔해서 학급별 책을 읽어보세요.</p>
        <Link
          href="/admin"
          className="text-sm text-stone-400 hover:text-stone-600 underline underline-offset-4"
        >
          관리자 로그인
        </Link>
      </div>
    </main>
  )
}
