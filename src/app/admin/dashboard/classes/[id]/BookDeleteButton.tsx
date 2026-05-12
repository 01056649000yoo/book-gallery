'use client'

import { useRouter } from 'next/navigation'

export default function BookDeleteButton({ bookId }: { bookId: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await fetch(`/api/admin/books/${bookId}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-stone-300 hover:text-red-400 transition-colors text-sm px-2"
    >
      삭제
    </button>
  )
}
