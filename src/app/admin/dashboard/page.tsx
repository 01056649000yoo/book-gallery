import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
  if (!(await isAuthenticated())) redirect('/admin')

  const { data: classes } = await supabaseAdmin
    .from('classes')
    .select('id, name, description, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="bookshelf-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">학급 관리</h1>
            <p className="text-stone-400 text-sm mt-1">학급을 개설하고 책을 전시하세요.</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              href="/admin/dashboard/classes/new"
              className="bg-stone-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              + 학급 개설
            </Link>
            <LogoutButton />
          </div>
        </div>

        {!classes?.length ? (
          <div className="bg-white rounded-2xl p-16 text-center text-stone-400">
            <p className="text-4xl mb-4">🏫</p>
            <p>아직 개설된 학급이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/admin/dashboard/classes/${cls.id}`}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-800 group-hover:text-stone-600 transition-colors">
                      {cls.name}
                    </h2>
                    {cls.description && (
                      <p className="text-stone-400 text-sm mt-1">{cls.description}</p>
                    )}
                  </div>
                  <span className="text-stone-300 text-xl">›</span>
                </div>
                <p className="text-xs text-stone-300 mt-4">
                  {new Date(cls.created_at).toLocaleDateString('ko-KR')} 개설
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
