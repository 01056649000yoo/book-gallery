'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'

interface Token {
  id: string
  expires_at: string
  is_active: boolean
  created_at: string
  book_id: string | null
}

interface Book {
  id: string
  title: string
  author: string
}

export default function QRManager({
  classId,
  tokens,
  books,
}: {
  classId: string
  tokens: Token[]
  books: Book[]
}) {
  const [qrType, setQrType] = useState<'class' | 'book'>('class')
  const [selectedBookId, setSelectedBookId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [activeToken, setActiveToken] = useState<string | null>(null)
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin

  async function handleCreate() {
    if (qrType === 'book' && !selectedBookId) return
    setLoading(true)

    const res = await fetch('/api/admin/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        class_id: classId,
        expires_at: new Date(expiresAt).toISOString(),
        book_id: qrType === 'book' ? selectedBookId : null,
      }),
    })

    if (res.ok) {
      const token = await res.json()
      const url = `${appUrl}/c/${token.id}`
      const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: '#1c1917' } })
      setQrDataUrl(dataUrl)
      setActiveToken(token.id)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleRevoke(tokenId: string) {
    if (!confirm('이 QR 코드를 비활성화하시겠습니까?')) return
    await fetch('/api/admin/qr', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_id: tokenId }),
    })
    if (activeToken === tokenId) { setQrDataUrl(null); setActiveToken(null) }
    router.refresh()
  }

  function handleDownload() {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `qr-${classId}.png`
    a.click()
  }

  const minDate = new Date()
  minDate.setMinutes(minDate.getMinutes() + 10)
  const minDateStr = minDate.toISOString().slice(0, 16)

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-stone-700 mb-4">새 QR 코드 생성</h2>
        <form action={handleCreate} className="flex flex-col gap-4">

          {/* QR 유형 선택 */}
          <div>
            <label className="block text-sm text-stone-500 mb-2">QR 유형</label>
            <div className="flex rounded-lg border border-stone-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setQrType('class')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  qrType === 'class'
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-500 hover:bg-stone-50'
                }`}
              >
                전체 책장
              </button>
              <button
                type="button"
                onClick={() => setQrType('book')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  qrType === 'book'
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-500 hover:bg-stone-50'
                }`}
              >
                단일 책
              </button>
            </div>
          </div>

          {/* 단일 책 선택 */}
          {qrType === 'book' && (
            <div>
              <label className="block text-sm text-stone-500 mb-2">책 선택 *</label>
              {books.length === 0 ? (
                <p className="text-sm text-stone-400 py-2">업로드된 책이 없습니다.</p>
              ) : (
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
                  required
                >
                  <option value="">책을 선택하세요</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} — {book.author}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-stone-500 mb-2">유효 기간 만료일 *</label>
            <input
              type="datetime-local"
              value={expiresAt}
              min={minDateStr}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || (qrType === 'book' && !selectedBookId)}
            className="bg-amber-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-amber-500 disabled:opacity-50 transition-colors"
          >
            {loading ? '생성 중...' : 'QR 코드 생성'}
          </button>
        </form>
      </div>

      {qrDataUrl && (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <h2 className="font-semibold text-stone-700 mb-4">생성된 QR 코드</h2>
          <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-4 w-48 h-48" />
          <p className="text-xs text-stone-400 mb-4 break-all">{appUrl}/c/{activeToken}</p>
          <button
            onClick={handleDownload}
            className="bg-stone-800 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            PNG 다운로드
          </button>
        </div>
      )}

      {tokens.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-stone-700 mb-4">활성 QR 코드 목록</h2>
          <div className="flex flex-col gap-3">
            {tokens.map((token) => {
              const expired = new Date(token.expires_at) < new Date()
              const linkedBook = token.book_id ? books.find((b) => b.id === token.book_id) : null
              return (
                <div key={token.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        token.book_id
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {token.book_id ? '단일 책' : '전체 책장'}
                      </span>
                      {linkedBook && (
                        <span className="text-xs text-stone-500 truncate max-w-[160px]">{linkedBook.title}</span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600 font-mono truncate max-w-xs">{token.id}</p>
                    <p className={`text-xs mt-0.5 ${expired ? 'text-red-400' : 'text-stone-400'}`}>
                      {expired ? '만료됨 · ' : '만료: '}
                      {new Date(token.expires_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevoke(token.id)}
                    className="text-stone-300 hover:text-red-400 text-sm transition-colors ml-4"
                  >
                    비활성화
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
