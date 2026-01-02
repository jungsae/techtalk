'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PostCard } from '@/components/posts/PostCard'
import { PostDetailModalWrapper } from '@/components/posts/PostDetailModalWrapper'
import Link from 'next/link'

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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const postId = searchParams.get('post')

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query) {
      searchPosts(query)
    } else {
      setPosts([])
    }
  }, [query])

  const searchPosts = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setPosts([])
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchTerm)}&limit=20`)
      if (!response.ok) throw new Error('Failed to search posts')

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error searching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background-light text-black font-display min-h-screen flex flex-col pb-16 sm:pb-0">
      <div className="flex flex-1 max-w-[1200px] w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 gap-4 sm:gap-6 lg:gap-8">
        <main className="flex flex-col flex-1 max-w-[640px] mx-auto w-full gap-6">
          {query && (
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-black">
                &quot;{query}&quot; 검색 결과
              </h1>
              {!loading && (
                <p className="text-sm text-gray-600 mt-1">
                  {posts.length}개의 게시글을 찾았습니다
                </p>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              검색 중...
            </div>
          ) : query && posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">검색 결과가 없습니다</p>
              <p className="text-sm">다른 검색어로 시도해보세요</p>
            </div>
          ) : query && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">검색어를 입력해주세요</p>
              <p className="text-sm">제목이나 내용으로 게시글을 검색할 수 있습니다</p>
            </div>
          )}
        </main>
      </div>
      <PostDetailModalWrapper postId={postId} />
    </div>
  )
}

