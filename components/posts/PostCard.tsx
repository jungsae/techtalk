'use client'

import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    created_at: string
    view_count: number
    user_profiles?: {
      username?: string | null
      avatar_url?: string | null
    } | null
  }
  variant?: 'default' | 'popular'
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

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 좋아요, 댓글 버튼을 클릭한 경우 링크로 이동하지 않음
    if ((e.target as HTMLElement).closest('button, [role="button"]')) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    // 모달로 게시글 상세 열기 (쿼리 파라미터 사용)
    router.push(`/?post=${post.id}`, { scroll: false })
  }

  if (variant === 'popular') {
    return (
      <article
        onClick={handleClick}
        className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden hover:border-primary/50 active:bg-gray-50 transition-colors cursor-pointer touch-manipulation flex flex-col h-full md:h-auto"
        style={{ minHeight: '280px' }}
      >
        <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1 h-full">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-black line-clamp-2 flex-1 min-w-0">
              {post.title}
            </h2>
            <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-800 text-xs sm:text-sm font-medium rounded-full shrink-0">
              🔥 인기
            </span>
          </div>
          <div className="text-black mb-4 sm:mb-5 md:mb-6 line-clamp-3 sm:line-clamp-4 md:line-clamp-5 text-sm sm:text-base leading-relaxed flex-1">
            {post.content}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-600 mt-auto">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-gray-900 font-medium">{post.user_profiles?.username || '익명'}</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
            <span>조회수 {post.view_count || 0}</span>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden hover:border-primary/50 active:bg-gray-50 transition-colors cursor-pointer touch-manipulation"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="size-9 sm:size-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px] shrink-0">
              <div className="bg-white rounded-full h-full w-full p-0.5 overflow-hidden">
                {post.user_profiles?.avatar_url ? (
                  <img
                    alt="Author Avatar"
                    className="w-full h-full object-cover rounded-full"
                    src={post.user_profiles.avatar_url}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full">
                    <span className="text-gray-600 text-xs sm:text-sm font-semibold">
                      {post.user_profiles?.username?.[0]?.toUpperCase() || 'A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-gray-900 font-semibold text-sm truncate">
                {post.user_profiles?.username || '익명'}
              </h3>
              <p className="text-gray-600 text-xs flex items-center gap-1">
                {formatTimeAgo(post.created_at)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg font-bold leading-tight line-clamp-2" style={{ color: 'var(--color-black)' }}>
            {post.title}
          </h2>
          <div className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--color-black)' }}>
            {post.content}
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-[#e5e7eb] flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <div 
            className="flex items-center gap-1.5 sm:gap-2 text-gray-600 transition-colors group touch-manipulation"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">favorite</span>
            <span className="text-xs sm:text-sm font-medium">0</span>
          </div>
          <div 
            className="flex items-center gap-1.5 sm:gap-2 text-gray-600 transition-colors touch-manipulation"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]">chat_bubble</span>
            <span className="text-xs sm:text-sm font-medium">0</span>
          </div>
          <span className="text-xs text-gray-500 hidden sm:inline">
            조회수 {post.view_count || 0}
          </span>
        </div>
        <span className="text-xs text-gray-500 sm:hidden">
          조회수 {post.view_count || 0}
        </span>
      </div>
    </article>
  )
}

