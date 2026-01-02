'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'

export function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
    setShowUserMenu(false)
  }

  // 로그인 페이지와 게시글 작성 페이지에서는 Navbar 숨김
  if (pathname === '/login' || pathname === '/posts/new' || pathname.startsWith('/posts/') && pathname.includes('/edit')) {
    return null
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white px-3 sm:px-4 md:px-6 lg:px-10 py-2.5 sm:py-3">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 text-black cursor-pointer">
              <div className="size-7 sm:size-8 rounded bg-primary flex items-center justify-center shrink-0" style={{ color: 'var(--color-blue-500)' }}>
                <span className="material-symbols-outlined text-lg sm:text-xl">terminal</span>
              </div>
              <h2 className="hidden sm:block text-base sm:text-lg font-bold leading-tight tracking-[-0.015em]">TechTalk</h2>
            </Link>
          </div>
          
          {/* 데스크톱 검색창 */}
          <div className="flex-1 max-w-[500px] hidden sm:flex mx-4">
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                  setSearchQuery('')
                }
              }}
              className="relative flex w-full items-center"
            >
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="block w-full rounded-lg border-none bg-background-light py-2.5 pl-10 pr-3 text-sm text-black placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="제목이나 내용으로 검색..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-shrink-0">
            {user ? (
              <>
                <NotificationDropdown userId={user.id} />
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 focus:outline-none touch-manipulation"
                    aria-label="사용자 메뉴"
                  >
                    <div className="size-8 sm:size-9 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                          src={user.user_metadata.avatar_url}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs sm:text-sm font-semibold">
                          {user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </button>
                  {/* 데스크톱 호버 메뉴 */}
                  <div className="hidden sm:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link
                        href="/posts/my"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        내 게시글
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                  {/* 모바일 터치 메뉴 */}
                  {showUserMenu && (
                    <div className="sm:hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="py-2">
                        <Link
                          href="/posts/my"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-3 text-sm text-gray-700 active:bg-gray-100 transition-colors touch-manipulation"
                        >
                          내 게시글
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 active:bg-gray-100 transition-colors touch-manipulation"
                        >
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-xs sm:text-sm font-medium touch-manipulation whitespace-nowrap"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
