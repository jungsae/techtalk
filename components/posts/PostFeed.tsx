'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { PostCard } from './PostCard'

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

export function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const loadPosts = useCallback(async (pageNum: number, append: boolean = false) => {
    if (loading) return

    try {
      setLoading(true)
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`)
      if (!response.ok) throw new Error('Failed to fetch posts')

      const data = await response.json()
      // API가 { posts, pagination } 형식이거나 배열을 직접 반환할 수 있음
      const newPosts = Array.isArray(data) ? data : (data.posts || [])

      if (append) {
        setPosts((prev) => [...prev, ...newPosts])
      } else {
        setPosts(newPosts)
      }

      setHasMore(newPosts.length === 10 && pageNum < (data.pagination?.totalPages || 1))
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }, [loading])

  useEffect(() => {
    loadPosts(1, false)
  }, [])

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1
          setPage(nextPage)
          loadPosts(nextPage, true)
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, page, loadPosts])

  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-lg mb-2">아직 게시글이 없습니다</p>
        <p className="text-sm">첫 번째 게시글을 작성해보세요!</p>
      </div>
    )
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          {loading && (
            <div className="text-gray-500 text-sm">로딩 중...</div>
          )}
        </div>
      )}
    </>
  )
}

