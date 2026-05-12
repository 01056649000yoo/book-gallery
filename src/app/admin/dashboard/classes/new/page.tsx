'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewClassPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/admin/dashboard/classes/${data.id}`)
    } else {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <main className="bookshelf-bg min-h-screen">
      <div className="max-w-lg mx-auto px-6 py-10">
        <Link href="/admin/dashboard" className="text-stone-400 text-sm hover:text-stone-600 mb-6 block">
          ← 목록으로
        </Link>
        <h1 className="text-2xl font-bold text-stone-800 mb-8">학급 개설</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">학급명 *</label>
              <input
                type="text"
                placeholder="예: 3학년 2반"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">설명 (선택)</label>
              <textarea
                placeholder="예: 2026년 봄 학기 책 전시회"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-stone-800 text-white rounded-lg px-4 py-3 font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '개설 중...' : '학급 개설'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
