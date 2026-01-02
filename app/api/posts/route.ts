import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const supabase = await createClient()

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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Fetch user profiles, Redis view counts, and comment counts separately for each post
    // Note: We can't use user_profiles:author_id relationship because 
    // posts.author_id references auth.users, not user_profiles directly
    // Redis 조회수를 가져와서 실시간 조회수 표시 (인기글과 동기화)
    const postsWithViewCounts = await Promise.all(
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

    return NextResponse.json({
      posts: postsWithViewCounts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        author_id: user.id,
      })
      .select(`
        id,
        title,
        content,
        author_id,
        created_at,
        updated_at,
        view_count
      `)
      .single()

    if (error) throw error

    // Fetch user profile separately to avoid foreign key relationship issues
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url')
      .eq('id', user.id)
      .single()

    // Add user profile to post response
    const postWithProfile = {
      ...post,
      user_profiles: userProfile,
    }

    // Save new post notification to all users (optional - you can add subscription system later)
    // For now, we'll skip this to avoid spamming all users
    // Uncomment below if you want to notify all users about new posts
    /*
    const supabaseAdmin = createAdminClient()
    const { data: allUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
    
    if (allUsers && allUsers.length > 0) {
      const userIds = allUsers.map((u) => u.id).filter((id) => id !== user.id)
      const { sendNewPostNotification } = await import('@/lib/fcm/notifications')
      sendNewPostNotification(userIds, post.id, title).catch(console.error)
    }
    */

    return NextResponse.json(postWithProfile, { status: 201 })
  } catch (error: any) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

