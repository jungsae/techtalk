import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PostActions } from '@/components/posts/PostActions'
import { CommentSection } from '@/components/comments/CommentSection'
import { PostHeader } from '@/components/posts/PostHeader'

async function getPost(id: string) {
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      author_id,
      created_at,
      updated_at,
      view_count,
      user_profiles:author_id (
        id,
        username,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error || !post) {
    return null
  }

  return post
}

async function incrementViewCount(postId: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/posts/${postId}/views`, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Failed to increment view count:', error)
  }
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

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    redirect('/')
  }

  // Increment view count (fire and forget)
  incrementViewCount(id)

  return (
    <div className="bg-background-light font-display text-black min-h-screen flex flex-col transition-colors duration-300">
      <PostHeader />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-6 py-6 md:px-10">
          <article className="flex flex-col gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900">
              {post.title}
            </h1>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gray-200 overflow-hidden">
                    {(post.user_profiles as any)?.avatar_url ? (
                      <img
                        alt="Author"
                        className="w-full h-full object-cover"
                        src={(post.user_profiles as any).avatar_url}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs font-semibold">
                        {((post.user_profiles as any)?.username?.[0] || 'A').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {(post.user_profiles as any)?.username || '익명'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatTimeAgo(post.created_at)} • 조회수 {post.view_count || 0}
                    </div>
                  </div>
                </div>
              </div>
              <PostActions post={post} />
            </div>
            <div className="text-base leading-relaxed text-black space-y-4 mt-2">
              <div className="whitespace-pre-wrap text-black">{post.content}</div>
            </div>
          </article>
          <CommentSection postId={id} />
        </div>
      </div>
    </div>
  )
}
