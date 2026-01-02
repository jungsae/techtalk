'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PostActionsProps {
  post: {
    id: string
    author_id: string
  }
}

export function PostActions({ post }: PostActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [supabase])

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete post')

      router.push('/')
      router.refresh()
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.id !== post.author_id) {
    return null
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/posts/${post.id}/edit`}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors"
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? '삭제 중...' : '삭제'}
      </button>
    </div>
  )
}

