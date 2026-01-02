'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { PostCard } from './PostCard'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

export function MyPostFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check authentication
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
      } else {
        setIsAuthenticated(true)
      }
    })
  }, [supabase, router])

  const loadPosts = useCallback(async (pageNum: number, append: boolean = false) => {
    if (loadingRef.current || !isAuthenticated) return

    try {
      loadingRef.current = true
      setLoading(true)
      const response = await fetch(`/api/posts/my?page=${pageNum}&limit=10`)
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      if (!response.ok) throw new Error('Failed to fetch posts')

      const data = await response.json()
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
      loadingRef.current = false
      setLoading(false)
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && !loadingRef.current) {
      loadPosts(1, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loadingRef.current || !isAuthenticated) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
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
  }, [hasMore, page, isAuthenticated, loadPosts])

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-lg mb-2">로그인이 필요합니다</p>
      </div>
    )
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-lg mb-2">아직 작성한 게시글이 없습니다</p>
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

