import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const classId = formData.get('class_id') as string
  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const description = formData.get('description') as string
  const coverFile = formData.get('cover') as File
  const pdfFile = formData.get('pdf') as File

  if (!classId || !title || !author || !coverFile || !pdfFile) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 })
  }

  if (pdfFile.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'PDF 파일은 30MB 이하만 업로드 가능합니다.' }, { status: 400 })
  }

  const timestamp = Date.now()
  const coverPath = `${classId}/${timestamp}_cover_${coverFile.name}`
  const pdfPath = `${classId}/${timestamp}_${pdfFile.name}`

  const [coverUpload, pdfUpload] = await Promise.all([
    supabaseAdmin.storage.from('covers').upload(coverPath, coverFile),
    supabaseAdmin.storage.from('pdfs').upload(pdfPath, pdfFile),
  ])

  if (coverUpload.error) return NextResponse.json({ error: coverUpload.error.message }, { status: 500 })
  if (pdfUpload.error) return NextResponse.json({ error: pdfUpload.error.message }, { status: 500 })

  const { data, error } = await supabaseAdmin
    .from('books')
    .insert({
      class_id: classId,
      title: title.trim(),
      author: author.trim(),
      description: description?.trim() || null,
      cover_image_path: coverPath,
      pdf_path: pdfPath,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
