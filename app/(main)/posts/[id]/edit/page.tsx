'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
export default function EditPostPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  // Handle both Promise and non-Promise params for compatibility
  const resolvedParams = 'then' in params ? use(params) : params
  const postId = resolvedParams.id

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setAuthenticated(true)

      const response = await fetch(`/api/posts/${postId}`)
      if (!response.ok) {
        router.push('/')
        return
      }

      const post = await response.json()
      
      if (post.author_id !== user.id) {
        router.push(`/posts/${postId}`)
        return
      }

      setFormData({
        title: post.title,
        content: post.content,
      })
      setLoadingPost(false)
    }

    fetchPost()
  }, [postId, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update post')

      router.push(`/posts/${postId}`)
    } catch (error) {
      alert('게시글 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!authenticated || loadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light text-gray-500">
        로딩 중...
      </div>
    )
  }

  return (
    <div className="bg-background-light text-black font-display min-h-screen flex flex-col relative">
      <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white px-4 sm:px-10 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-black cursor-pointer">
            <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">terminal</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">TechTalk</h2>
          </Link>
        </div>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="w-full">
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-primary focus:ring-0 px-0 py-4 text-3xl sm:text-4xl font-bold placeholder-gray-300 transition-colors text-black"
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          <div className="flex flex-col flex-1 min-h-[500px] bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 p-2 border-b border-[#e5e7eb] bg-gray-50 flex-wrap sticky top-0 z-10">
              <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">format_bold</span>
                </button>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  마크다운 지원
                </span>
              </div>
            </div>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="flex-1 w-full p-4 bg-transparent border-none resize-none focus:ring-0 text-black placeholder-gray-400 min-h-[400px]"
              placeholder="내용을 입력하세요..."
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? '수정 중...' : '수정하기'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

