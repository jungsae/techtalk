import { redis } from '@/lib/redis/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// This endpoint should be called by Vercel Cron Job
// to sync Redis view counts to Supabase database
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // keys() 명령어는 비용이 높으므로 인기글 sorted set에서 포스트 ID 가져오기
    // 상위 1000개 포스트만 동기화 (충분히 많은 수)
    const popularPostIds = await redis.zrange<string[]>(
      'popular:posts',
      0,
      999,
      { rev: true }
    )

    if (!popularPostIds || popularPostIds.length === 0) {
      return NextResponse.json({ message: 'No posts to sync' })
    }

    const supabase = createAdminClient()
    let syncedCount = 0

    // Batch update view counts in Supabase (keys() 대신 직접 post ID 사용)
    const updatePromises = popularPostIds.map(async (postId) => {
      const viewCount = await redis.get<number>(`post:views:${postId}`)

      if (viewCount && viewCount > 0) {
        const { error } = await supabase
          .from('posts')
          .update({ view_count: Number(viewCount) })
          .eq('id', postId)

        if (!error) {
          syncedCount++
          return true
        }
      }
      return false
    })

    await Promise.all(updatePromises)

    return NextResponse.json({
      message: `Synced ${syncedCount} post view counts`,
      syncedCount,
    })
  } catch (error: any) {
    console.error('Error syncing view counts:', error)
    return NextResponse.json(
      { error: 'Failed to sync view counts' },
      { status: 500 }
    )
  }
}

