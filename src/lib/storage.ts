import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads')

export async function saveFile(bucket: string, filePath: string, file: File): Promise<void> {
  const fullPath = path.join(UPLOAD_DIR, bucket, filePath)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(fullPath, buffer)
}

export async function deleteFile(bucket: string, filePath: string): Promise<void> {
  const fullPath = path.join(UPLOAD_DIR, bucket, filePath)
  await fs.unlink(fullPath).catch(() => {})
}

export async function readFileAt(bucket: string, filePath: string): Promise<{ path: string; size: number }> {
  const normalized = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '')
  const fullPath = path.join(UPLOAD_DIR, bucket, normalized)

  if (!fullPath.startsWith(path.join(UPLOAD_DIR, bucket))) {
    throw new Error('Invalid path')
  }

  const stat = await fs.stat(fullPath)
  return { path: fullPath, size: stat.size }
}

export function getFileUrl(bucket: string, filePath: string, token?: string): string {
  const params = new URLSearchParams({ bucket, path: filePath })
  if (token) params.set('token', token)
  return `/api/files?${params.toString()}`
}
