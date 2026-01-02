'use client'

import Link from 'next/link'

export function FloatingWriteButton() {
  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 lg:bottom-10 lg:right-10 z-50">
      <Link
        href="/posts/new"
        className="size-12 sm:size-14 lg:size-16 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 group touch-manipulation"
        title="새 게시글 작성"
      >
        <span className="material-symbols-outlined text-[28px] sm:text-[32px] text-white group-hover:rotate-90 transition-transform duration-300">
          add
        </span>
      </Link>
    </div>
  )
}

