import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '학교 책 갤러리',
  description: '학생들의 소중한 작품을 온라인으로 만나보세요.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
