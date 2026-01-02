import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Fetch user profiles separately for each post
    // Redis 조회수는 목록에서 제외 (Supabase view_count 사용, 크론이 6시간마다 동기화)
    const postsWithProfiles = await Promise.all(
      (posts || []).map(async (post) => {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('id, username, avatar_url')
          .eq('id', post.author_id)
          .single()

        return {
          ...post,
          view_count: post.view_count || 0,
          user_profiles: userProfile,
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

