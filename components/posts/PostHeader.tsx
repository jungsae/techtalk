'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function PostHeader() {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] shrink-0 bg-background-light transition-colors duration-300 sticky top-0 z-40">
      <h2 className="text-lg font-bold leading-tight tracking-tight text-black">
        게시글 상세
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 transition-colors text-gray-600"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>
    </header>
  )
}

