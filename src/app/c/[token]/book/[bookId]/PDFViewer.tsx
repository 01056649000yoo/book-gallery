'use client'

import { useState, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export default function PDFViewer({ pdfUrl }: { pdfUrl: string }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
  }, [])

  const onLoadProgress = useCallback(({ loaded, total }: { loaded: number; total: number }) => {
    if (total > 0) setLoadProgress(Math.round((loaded / total) * 100))
  }, [])

  const goToPrev = () => setPageNumber((p) => Math.max(1, p - 1))
  const goToNext = () => setPageNumber((p) => Math.min(numPages, p + 1))

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center py-8 px-4 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {loading && (
        <div className="flex flex-col items-center gap-3 text-stone-400">
          <div className="w-48 h-1.5 bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-sm">
            {loadProgress > 0 ? `${loadProgress}% 불러오는 중...` : 'PDF 불러오는 중...'}
          </p>
        </div>
      )}

      <Document
        file={pdfUrl}
        onLoadSuccess={onLoadSuccess}
        onLoadProgress={onLoadProgress}
        loading={null}
        className="flex justify-center"
        options={{ disableStream: false, disableAutoFetch: false }}
      >
        <div className="relative shadow-2xl rounded-sm overflow-hidden">
          <Page
            pageNumber={pageNumber}
            height={typeof window !== 'undefined' ? Math.min(window.innerHeight - 180, 800) : 700}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="block"
          />
        </div>
      </Document>

      {!loading && numPages > 0 && (
        <div className="flex items-center gap-6 mt-8">
          <button
            onClick={goToPrev}
            disabled={pageNumber <= 1}
            className="w-10 h-10 rounded-full bg-stone-700 text-white flex items-center justify-center hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
            aria-label="이전 페이지"
          >
            ‹
          </button>
          <span className="text-stone-400 text-sm min-w-[80px] text-center">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={goToNext}
            disabled={pageNumber >= numPages}
            className="w-10 h-10 rounded-full bg-stone-700 text-white flex items-center justify-center hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
            aria-label="다음 페이지"
            >
            ›
          </button>
        </div>
      )}

      {!loading && (
        <div className="mt-4 flex gap-2 items-center">
          <input
            type="range"
            min={1}
            max={numPages}
            value={pageNumber}
            onChange={(e) => setPageNumber(Number(e.target.value))}
            className="w-40 accent-amber-500"
          />
        </div>
      )}
    </div>
  )
}
