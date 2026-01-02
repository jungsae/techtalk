import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendCommentNotification, sendReplyNotification } from '@/lib/fcm/notifications'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const supabase = await createClient()

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        post_id,
        author_id,
        content,
        parent_id,
        created_at,
        updated_at
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Fetch user profiles separately for each comment
    // Note: We can't use user_profiles:author_id relationship because 
    // comments.author_id references auth.users, not user_profiles directly
    const commentsWithProfiles = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('id, username, avatar_url')
          .eq('id', comment.author_id)
          .single()

        return {
          ...comment,
          user_profiles: userProfile,
        }
      })
    )

    return NextResponse.json(commentsWithProfiles)
  } catch (error: any) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const body = await request.json()
    const { content, parent_id } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // If parent_id is provided, validate it
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id, post_id')
        .eq('id', parent_id)
        .eq('post_id', postId)
        .single()

      if (parentError || !parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 400 }
        )
      }
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content: content.trim(),
        parent_id: parent_id || null,
      })
      .select(`
        id,
        post_id,
        author_id,
        content,
        parent_id,
        created_at,
        updated_at
      `)
      .single()

    if (error) throw error

    // Fetch user profile separately
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url')
      .eq('id', user.id)
      .single()

    const commentWithProfile = {
      ...comment,
      user_profiles: userProfile,
    }

    // Send notification
    if (parent_id) {
      // Get parent comment author
      const { data: parentComment } = await supabase
        .from('comments')
        .select('author_id')
        .eq('id', parent_id)
        .single()

      if (parentComment) {
        sendReplyNotification(
          postId,
          comment.id,
          user.id,
          parentComment.author_id
        ).catch(console.error)
      }
    } else {
      // Send notification to post author
      sendCommentNotification(
        postId,
        comment.id,
        user.id,
        post.author_id
      ).catch(console.error)
    }

    return NextResponse.json(commentWithProfile, { status: 201 })
  } catch (error: any) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

