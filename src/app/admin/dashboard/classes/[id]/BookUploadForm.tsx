'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BookUploadForm({ classId }: { classId: string }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit() {
    if (!cover || !pdf) { setError('표지 이미지와 PDF를 모두 선택해주세요.'); return }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('class_id', classId)
    formData.append('title', title)
    formData.append('author', author)
    formData.append('description', description)
    formData.append('cover', cover)
    formData.append('pdf', pdf)

    const res = await fetch('/api/admin/books', { method: 'POST', body: formData })

    if (res.ok) {
      setTitle(''); setAuthor(''); setDescription('')
      setCover(null); setPdf(null)
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? '업로드에 실패했습니다.')
    }
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="책 제목 *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
        required
      />
      <input
        type="text"
        placeholder="지은이 *"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
        required
      />
      <textarea
        placeholder="책 소개 (선택)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
      />
      <div>
        <label className="block text-xs text-stone-400 mb-1">표지 이미지 * (JPG, PNG)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-stone-400 mb-1">PDF 파일 * (최대 30MB)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-stone-800 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
      >
        {loading ? '업로드 중...' : '책 업로드'}
      </button>
    </form>
  )
}
