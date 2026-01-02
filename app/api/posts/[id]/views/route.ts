import { createClient } from '@/lib/supabase/server'
import { redis } from '@/lib/redis/client'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createClient()
    
    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Get current user (if logged in)
    const { data: { user } } = await supabase.auth.getUser()

    let shouldIncrement = false

    if (user) {
      // 로그인한 사용자: 이미 조회했는지 확인
      const viewedKey = `viewed:${user.id}:${postId}`
      const alreadyViewed = await redis.get(viewedKey)

      if (!alreadyViewed) {
        // 처음 조회한 경우에만 카운트 증가
        shouldIncrement = true
        // 조회 기록 저장 (1년 후 만료) - setex 사용
        await redis.setex(viewedKey, 60 * 60 * 24 * 365, '1')
      }
    } else {
      // 로그인하지 않은 사용자는 카운트하지 않음
      // (또는 IP 기반으로 처리할 수 있으나, 여기서는 제외)
      shouldIncrement = false
    }

    let viewCount: number

    if (shouldIncrement) {
      // Increment view count in Redis
      viewCount = await redis.incr(`post:views:${postId}`)
      
      // Add to popular posts sorted set (score is view count)
      await redis.zadd('popular:posts', {
        score: viewCount,
        member: postId,
      })

      // Set expiration for view count (optional, for data cleanup)
      await redis.expire(`post:views:${postId}`, 60 * 60 * 24 * 30) // 30 days
    } else {
      // 조회수 증가하지 않았지만 현재 조회수 반환
      viewCount = await redis.get<number>(`post:views:${postId}`) ?? 0
    }

    return NextResponse.json({ 
      viewCount: Number(viewCount),
      postId,
      incremented: shouldIncrement
    })
  } catch (error: any) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    
    // Get view count from Redis
    const viewCount = await redis.get<number>(`post:views:${postId}`) ?? 0

    return NextResponse.json({ 
      viewCount: Number(viewCount),
      postId 
    })
  } catch (error: any) {
    console.error('Error getting view count:', error)
    return NextResponse.json(
      { error: 'Failed to get view count' },
      { status: 500 }
    )
  }
}

