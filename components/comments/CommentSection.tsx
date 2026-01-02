'use client'

import { useEffect, useState } from 'react'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchComments()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [...prev, newComment])
  }

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
    )
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  if (loading) {
    return <div className="text-center py-8">댓글을 불러오는 중...</div>
  }

  // Organize comments into a tree structure
  const rootComments = comments.filter((c) => !c.parent_id)
  const repliesMap = new Map<string, Comment[]>()
  
  comments
    .filter((c) => c.parent_id)
    .forEach((comment) => {
      const parentId = comment.parent_id!
      if (!repliesMap.has(parentId)) {
        repliesMap.set(parentId, [])
      }
      repliesMap.get(parentId)!.push(comment)
    })

  return (
    <section className="mt-6 sm:mt-8">
      <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-black">토론</h3>
      {user ? (
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      ) : (
        <div className="mb-8 p-4 bg-[#f6f7f8] rounded-lg text-center border border-[#e5e7eb]">
          <Link href="/login" className="text-primary hover:text-blue-600 font-medium">
            로그인
          </Link>
          하여 댓글을 작성하세요.
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        {rootComments.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-600">
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </div>
        ) : (
          <CommentList
            comments={rootComments}
            repliesMap={repliesMap}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
            currentUserId={user?.id}
          />
        )}
      </div>
    </section>
  )
}

