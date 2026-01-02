import { createClient } from '@/lib/supabase/server'
import { redis } from '@/lib/redis/client'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createClient()

    const { data: post, error } = await supabase
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
      .eq('id', postId)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Fetch user profile, Redis view count, and comment count separately
    // Note: We can't use user_profiles:author_id relationship because 
    // posts.author_id references auth.users, not user_profiles directly
    const [userProfileResult, redisViewCount, commentCountResult] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('id, username, avatar_url')
        .eq('id', post.author_id)
        .single(),
      redis.get<number>(`post:views:${postId}`),
      supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId),
    ])
    
    return NextResponse.json({
      ...post,
      view_count: Math.max(post.view_count || 0, Number(redisViewCount || 0)),
      comment_count: commentCountResult.count || 0,
      user_profiles: userProfileResult.data,
    })
  } catch (error: any) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if post exists and user is the author
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (existingPost.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
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

    // Fetch user profile separately
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url')
      .eq('id', post.author_id)
      .single()

    return NextResponse.json({
      ...post,
      user_profiles: userProfile,
    })
  } catch (error: any) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if post exists and user is the author
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (existingPost.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from Redis as well
    await redis.del(`post:views:${postId}`)
    await redis.zrem('popular:posts', postId)

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) throw error

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}

