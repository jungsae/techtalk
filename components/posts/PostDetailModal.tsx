'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CommentSection } from '@/components/comments/CommentSection'

interface Post {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  updated_at: string
  view_count: number
  user_profiles: {
    id: string
    username: string | null
    avatar_url: string | null
  } | null
}

interface PostDetailModalProps {
  post: Post
}

function formatTimeAgo(date: string) {
  const now = new Date()
  const postDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
  return postDate.toLocaleDateString('ko-KR')
}

export function PostDetailModal({ post }: PostDetailModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    // 모달이 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [supabase])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('post')
    const newUrl = params.toString() ? `/?${params.toString()}` : '/'
    router.push(newUrl, { scroll: false })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal()
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete post')

      closeModal()
      router.refresh()
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const isAuthor = user && user.id === post.author_id

  return (
    <div onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* 오버레이 */}
      <div
        aria-hidden="true"
        onClick={handleOverlayClick}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]"
      />
      
      {/* 모달 컨텐츠 */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 pointer-events-none"
        style={{ backgroundColor: 'var(--color-gray-400)' }}
      >
        <div className="relative w-full h-full sm:max-w-4xl sm:h-[90vh] bg-background-light sm:rounded-xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-transparent transition-colors duration-300 pointer-events-auto opacity-0 scale-95 animate-[fadeInZoom_0.3s_ease-out_forwards]">
          {/* 헤더 */}
          <header 
            className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#e5e7eb] shrink-0 transition-colors duration-300"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <h2 className="text-base sm:text-lg font-bold leading-tight tracking-tight text-black">
              게시글 상세
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={closeModal}
                className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors text-gray-600 touch-manipulation"
                aria-label="닫기"
              >
                <span className="material-symbols-outlined text-[22px] sm:text-[24px]">close</span>
              </button>
            </div>
          </header>

          {/* 스크롤 가능한 콘텐츠 */}
          <div 
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <div 
              className="px-4 sm:px-6 md:px-10 py-4 sm:py-6"
              style={{ backgroundColor: 'var(--background)' }}
            >
              {/* 작성자 정보 */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cover bg-center border border-[#e5e7eb] overflow-hidden shrink-0">
                    {post.user_profiles?.avatar_url ? (
                      <img
                        alt="게시글 작성자 프로필 사진"
                        className="w-full h-full object-cover"
                        src={post.user_profiles.avatar_url}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm font-semibold">
                        {post.user_profiles?.username?.[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-black truncate">
                        {post.user_profiles?.username || '익명'}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">
                      {formatTimeAgo(post.created_at)} • 조회수 {post.view_count || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* 게시글 본문 */}
              <article className="flex flex-col gap-3 sm:gap-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-black">
                  {post.title}
                </h1>
                
                <div className="text-sm sm:text-base leading-relaxed text-black space-y-4 mt-2">
                  <div className="whitespace-pre-wrap break-words">{post.content}</div>
                </div>
              </article>

              {/* 액션 버튼들 */}
              <div className="flex items-center justify-between py-4 sm:py-6 mt-4 sm:mt-6 border-b border-[#e5e7eb] gap-2">
                <div className="flex items-center gap-4 sm:gap-6 flex-1">
                  <button className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-primary active:text-primary/80 transition-colors group touch-manipulation">
                    <span className="material-symbols-outlined group-hover:fill-current text-[20px] sm:text-[24px]">favorite</span>
                    <span className="text-xs sm:text-sm font-medium">0</span>
                  </button>
                  <button className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-black active:opacity-70 transition-colors touch-manipulation">
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chat_bubble</span>
                    <span className="text-xs sm:text-sm font-medium">0</span>
                  </button>
                  <button className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-black active:opacity-70 transition-colors touch-manipulation">
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">share</span>
                  </button>
                </div>
                <button className="text-gray-600 hover:text-primary active:opacity-70 transition-colors touch-manipulation p-1">
                  <span className="material-symbols-outlined text-[20px] sm:text-[24px]">bookmark</span>
                </button>
              </div>

              {/* 작성자일 경우 수정/삭제 버튼 */}
              {isAuthor && (
                <div className="flex items-center gap-3 sm:gap-4 py-4 sm:py-6 border-b border-[#e5e7eb]">
                  <Link
                    href={`/posts/${post.id}/edit`}
                    onClick={closeModal}
                    className="px-4 sm:px-6 py-2 bg-primary text-white rounded-md sm:rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium text-sm sm:text-base touch-manipulation"
                    style={{ color: 'var(--color-black)' }}
                  >
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-md sm:rounded-lg hover:bg-red-700 active:bg-red-800 disabled:opacity-50 transition-colors font-medium text-sm sm:text-base touch-manipulation"
                  >
                    {deleteLoading ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              )}

              {/* 댓글 섹션 */}
              <CommentSection postId={post.id} />
              
              <div className="h-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

