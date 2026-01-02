'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchModal, setShowSearchModal] = useState(false)

  // 특정 페이지에서는 하단 네비게이션 숨김
  if (pathname === '/login' || pathname === '/posts/new' || (pathname.startsWith('/posts/') && pathname.includes('/edit'))) {
    return null
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setShowSearchModal(false)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e5e7eb] sm:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            isActive('/') 
              ? 'text-primary' 
              : 'text-gray-600 active:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isActive('/') ? 'home' : 'home'}
          </span>
          <span className="text-xs font-medium">피드</span>
        </Link>

        <Link
          href="/popular"
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
            isActive('/popular') 
              ? 'text-primary' 
              : 'text-gray-600 active:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isActive('/popular') ? 'local_fire_department' : 'local_fire_department'}
          </span>
          <span className="text-xs font-medium">인기글</span>
        </Link>

        <Link
          href="/posts/new"
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-gray-600 active:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">add_circle</span>
          <span className="text-xs font-medium">작성</span>
        </Link>

        <button
          onClick={() => setShowSearchModal(true)}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-gray-600 active:text-primary transition-colors"
          aria-label="검색"
        >
          <span className="material-symbols-outlined text-[24px]">search</span>
          <span className="text-xs font-medium">검색</span>
        </button>

        <button
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-gray-600 active:text-primary transition-colors"
          aria-label="프로필"
        >
          <span className="material-symbols-outlined text-[24px]">person</span>
          <span className="text-xs font-medium">프로필</span>
        </button>
      </div>

      {/* 검색 모달 */}
      {showSearchModal && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowSearchModal(false)}
        >
          <div 
            className="fixed top-0 left-0 right-0 bg-white border-b border-[#e5e7eb] p-4 animate-in slide-in-from-top duration-200 z-[60] pt-[64px]"
            onClick={(e) => e.stopPropagation()}
          >
            <form 
              onSubmit={handleSearch}
              className="flex items-center gap-3"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  className="block w-full rounded-lg border-none bg-background-light py-3 pl-10 pr-3 text-base text-black placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="제목이나 내용으로 검색..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="px-3 py-2 text-gray-700 active:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              >
                취소
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}

