import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    if (!query.trim()) {
      return NextResponse.json({
        posts: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
        },
      })
    }

    const supabase = await createClient()

    // 제목이나 내용에서 검색 (PostgreSQL의 ilike 사용 - 대소문자 구분 없음)
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
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Fetch user profiles, Redis view counts, and comment counts separately for each post
    // Redis 조회수를 가져와서 실시간 조회수 표시 (인기글과 동기화)
    const postsWithProfiles = await Promise.all(
      (posts || []).map(async (post) => {
        const [userProfileResult, redisViewCount, commentCountResult] = await Promise.all([
          supabase
            .from('user_profiles')
            .select('id, username, avatar_url')
            .eq('id', post.author_id)
            .single(),
          redis.get<number>(`post:views:${post.id}`),
          supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', post.id),
        ])

        return {
          ...post,
          // Redis 조회수를 우선 사용하고, 없으면 Supabase view_count 사용 (인기글과 동기화)
          view_count: Math.max(post.view_count || 0, Number(redisViewCount || 0)),
          comment_count: commentCountResult.count || 0,
          user_profiles: userProfileResult.data,
        }
      })
    )

    // Get total count for pagination
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)

    return NextResponse.json({
      posts: postsWithProfiles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error searching posts:', error)
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    )
  }
}

