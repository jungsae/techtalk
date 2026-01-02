'use client'

import { CommentItem } from './CommentItem'

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

interface CommentListProps {
  comments: Comment[]
  repliesMap: Map<string, Comment[]>
  onCommentAdded: (comment: Comment) => void
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
  currentUserId?: string
}

export function CommentList({
  comments,
  repliesMap,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
  currentUserId,
}: CommentListProps) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={repliesMap.get(comment.id) || []}
          repliesMap={repliesMap}
          onCommentAdded={onCommentAdded}
          onCommentUpdated={onCommentUpdated}
          onCommentDeleted={onCommentDeleted}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}

