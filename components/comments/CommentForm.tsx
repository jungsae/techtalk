'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
  user_profiles: {
    id: string
    username: string | null
    avatar_url: string | null
  } | null
}

interface CommentFormProps {
  postId: string
  parentId?: string
  onCommentAdded: (comment: Comment) => void
  onCancel?: () => void
}

export function CommentForm({
  postId,
  parentId,
  onCommentAdded,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          parent_id: parentId || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create comment')

      const newComment = await response.json()
      setContent('')
      onCommentAdded(newComment)
      if (onCancel) {
        onCancel()
      }
    } catch (error) {
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
      <div className="flex gap-3 sm:gap-4">
        <div className="shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img
                alt="Avatar"
                className="w-full h-full object-cover"
                src={user.user_metadata.avatar_url}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </div>
        <div className="flex-grow">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-[#f6f7f8] text-black border border-[#e5e7eb] rounded-lg p-3 min-h-[80px] sm:min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-y"
            placeholder={parentId ? '대댓글을 입력하세요...' : '토론에 참여하세요...'}
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 active:opacity-70 text-xs sm:text-sm transition-colors touch-manipulation"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-xs sm:text-sm font-medium transition-colors touch-manipulation"
            >
              {loading ? '작성 중...' : '작성'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

