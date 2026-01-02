'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PostDetailModal } from './PostDetailModal'

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

interface PostDetailModalWrapperProps {
  postId?: string
}

export function PostDetailModalWrapper({ postId: postIdProp }: PostDetailModalWrapperProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(false)

  const postId = postIdProp || searchParams.get('post')

  useEffect(() => {
    if (postId) {
      fetchPost(postId)
      
      // 조회수 증가
      fetch(`/api/posts/${postId}/views`, {
        method: 'POST',
      }).catch(console.error)
    } else {
      setPost(null)
    }
  }, [postId])

  const fetchPost = async (id: string) => {
    try {
      setLoading(true)
      // cache: 'no-store'를 사용하여 항상 최신 데이터를 가져옴
      const response = await fetch(`/api/posts/${id}`, {
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else {
        // 게시글을 찾을 수 없으면 모달 닫기
        closeModal()
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      closeModal()
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    // 현재 경로에 따라 적절한 URL로 리다이렉트
    const currentPath = window.location.pathname
    const params = new URLSearchParams(searchParams.toString())
    params.delete('post')
    
    // 검색 페이지에서는 검색 쿼리 유지
    if (currentPath === '/search') {
      const query = searchParams.get('q')
      if (query) {
        params.set('q', query)
      }
      const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
      router.push(newUrl, { scroll: false })
    } else {
      const newUrl = params.toString() ? `/?${params.toString()}` : '/'
      router.push(newUrl, { scroll: false })
    }
  }

  if (!postId || loading) {
    return null
  }

  if (!post) {
    return null
  }

  return <PostDetailModal post={post} />
}

