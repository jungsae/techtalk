'use client'

import { useState } from 'react'
import { CommentForm } from './CommentForm'

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

interface CommentItemProps {
  comment: Comment
  replies: Comment[]
  repliesMap: Map<string, Comment[]>
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
  currentUserId?: string
}

export function CommentItem({
  comment,
  replies,
  repliesMap,
  onCommentUpdated,
  onCommentDeleted,
  currentUserId,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent.trim() }),
      })

      if (!response.ok) throw new Error('Failed to update comment')

      const updatedComment = await response.json()
      onCommentUpdated(updatedComment)
      setIsEditing(false)
    } catch (error) {
      alert('댓글 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete comment')

      onCommentDeleted(comment.id)
    } catch (error) {
      alert('댓글 삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReplyAdded = (newReply: Comment) => {
    onCommentUpdated(newReply)
    setIsReplying(false)
  }

  const isOwner = currentUserId === comment.author_id

  return (
    <div className={`${comment.parent_id ? 'ml-4 sm:ml-8 border-l-2 border-[#e5e7eb] pl-3 sm:pl-4' : ''}`}>
      <div className="bg-[#f6f7f8] rounded-lg p-3 sm:p-4 border border-[#e5e7eb]">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="size-7 sm:size-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {comment.user_profiles?.avatar_url ? (
                <img
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  src={comment.user_profiles.avatar_url}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs font-semibold">
                  {comment.user_profiles?.username?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-black block text-xs sm:text-sm truncate">
                {comment.user_profiles?.username || '익명'}
              </span>
              <span className="text-xs text-gray-600">
                {new Date(comment.created_at).toLocaleString('ko-KR', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-primary hover:text-blue-600 active:opacity-70 transition-colors touch-manipulation"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-xs text-red-600 hover:text-red-800 active:opacity-70 disabled:opacity-50 transition-colors touch-manipulation"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2 mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm text-black placeholder-gray-600"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                }}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-900 active:opacity-70 text-xs sm:text-sm transition-colors touch-manipulation"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading}
                className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 text-xs sm:text-sm disabled:opacity-50 transition-colors touch-manipulation"
              >
                {loading ? '수정 중...' : '저장'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-900 whitespace-pre-wrap mb-2 text-xs sm:text-sm leading-relaxed break-words">
              {comment.content}
            </p>
            {!comment.parent_id && currentUserId && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-primary hover:text-blue-600 active:opacity-70 transition-colors touch-manipulation"
              >
                {isReplying ? '취소' : '답글'}
              </button>
            )}
          </>
        )}
      </div>

      {isReplying && (
        <div className="mt-4">
          <CommentForm
            postId={comment.post_id}
            parentId={comment.id}
            onCommentAdded={handleReplyAdded}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={repliesMap.get(reply.id) || []}
              repliesMap={repliesMap}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

