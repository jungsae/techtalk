'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
export default function NewPostPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
      } else {
        setAuthenticated(true)
        setUser(data.user)
      }
    })
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create post')

      const post = await response.json()
      router.push(`/posts/${post.id}`)
    } catch (error) {
      alert('게시글 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!authenticated) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  return (
    <div className="bg-background-light text-black font-display min-h-screen flex flex-col relative">
      <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white px-3 sm:px-4 md:px-6 lg:px-10 py-2.5 sm:py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 text-black cursor-pointer min-w-0">
            <div className="size-7 sm:size-8 rounded bg-primary flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-lg sm:text-xl">terminal</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">TechTalk</h2>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="size-8 sm:size-9 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
                {user.user_metadata?.avatar_url ? (
                  <img alt="User Avatar" className="w-full h-full object-cover" src={user.user_metadata.avatar_url} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs sm:text-sm font-semibold">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex flex-col gap-4 sm:gap-6">
        <div className="w-full">
          <input
            className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-3 sm:py-4 text-2xl sm:text-3xl md:text-4xl font-bold placeholder-gray-400 transition-colors text-black"
            placeholder="제목을 입력하세요"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-[400px] sm:min-h-[500px]">
          <div className="flex flex-col flex-1 min-h-[400px] sm:min-h-[500px] bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 p-2 border-b border-[#e5e7eb] bg-gray-50 flex-wrap sticky top-0 z-10">
              <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
                <button
                  type="button"
                  className="p-1.5 sm:p-2 rounded hover:bg-gray-200 active:bg-gray-300 text-gray-600 transition-colors touch-manipulation"
                >
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">format_bold</span>
                </button>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  마크다운 지원
                </span>
              </div>
            </div>
            <textarea
              className="flex-1 w-full p-3 sm:p-4 bg-transparent border-none resize-none focus:ring-0 text-sm sm:text-base text-black placeholder-gray-600"
              placeholder="내용을 입력하세요..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-3 sm:gap-4 mt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 sm:px-6 py-2 border border-gray-300 rounded-md sm:rounded-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base touch-manipulation"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-2 bg-primary text-white rounded-md sm:rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm sm:text-base touch-manipulation relative"
            >
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </span>
              )}
              <span className={loading ? 'opacity-0' : ''}>작성하기</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
