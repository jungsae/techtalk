import { redis } from '@/lib/redis/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const days = parseInt(searchParams.get('days') || '7')

    // Get popular post IDs from Redis sorted set (reverse order - highest scores first)
    const popularPostIds = await redis.zrange<string[]>(
      'popular:posts',
      0,
      limit - 1,
      { rev: true }
    )

    if (!popularPostIds || popularPostIds.length === 0) {
      return NextResponse.json([])
    }

    // Get post details from Supabase
    const supabase = createAdminClient()
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        author_id,
        created_at,
        updated_at,
        view_count
      `)
      .in('id', popularPostIds)

    if (error) {
      throw error
    }

    // Sort posts by the order from Redis
    const sortedPosts = popularPostIds
      .map((id) => posts?.find((post) => post.id === id))
      .filter((post) => post !== undefined)

    // Fetch user profiles and Redis view counts for each post
    // Note: We can't use user_profiles:author_id relationship because 
    // posts.author_id references auth.users, not user_profiles directly
    const postsWithViewCounts = await Promise.all(
      sortedPosts.map(async (post) => {
        const [userProfileResult, redisViewCount] = await Promise.all([
          supabase
            .from('user_profiles')
            .select('id, username, avatar_url')
            .eq('id', post.author_id)
            .single(),
          redis.get<number>(`post:views:${post.id}`),
        ])

        return {
          ...post,
          view_count: Math.max(post?.view_count || 0, Number(redisViewCount || 0)),
          user_profiles: userProfileResult.data,
        }
      })
    )

    return NextResponse.json(postsWithViewCounts)
  } catch (error: any) {
    console.error('Error fetching popular posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular posts' },
      { status: 500 }
    )
  }
}

