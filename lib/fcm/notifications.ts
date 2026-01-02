import { fcmAdmin } from './admin'
import { createAdminClient } from '@/lib/supabase/admin'

// FCM이 초기화되었는지 확인
const isFCMInitialized = () => {
  try {
    return fcmAdmin.apps.length > 0
  } catch {
    return false
  }
}

interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, string>
}

/**
 * 사용자에게 FCM 푸시 알림을 보내고 Supabase에 저장합니다
 */
export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
) {
  try {
    const supabase = createAdminClient()
    
    // 1. Supabase에 알림 내역 저장
    const notificationType = payload.data?.type || 'general'
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notificationType,
        title: payload.title,
        body: payload.body,
        related_post_id: payload.data?.postId || null,
        related_comment_id: payload.data?.commentId || null,
        is_read: false,
      })

    if (insertError) {
      console.error('Failed to save notification to database:', insertError)
      // 알림 저장 실패해도 FCM 전송은 시도
    }

    // 2. FCM 푸시 알림 전송 (FCM이 초기화된 경우에만)
    if (!isFCMInitialized()) {
      console.warn('FCM이 초기화되지 않았습니다. 푸시 알림을 보낼 수 없습니다.')
      // FCM 없이도 Supabase에는 저장되었으므로 성공으로 간주
      return { success: true, sent: 0, failed: 0, saved: true }
    }

    // Get user's FCM tokens
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('fcm_tokens')
      .eq('id', userId)
      .single()

    if (error || !profile || !profile.fcm_tokens || profile.fcm_tokens.length === 0) {
      // FCM 토큰이 없어도 Supabase에는 저장되었으므로 성공으로 간주
      return { success: true, sent: 0, failed: 0, saved: true, message: 'No FCM tokens found' }
    }

    const tokens = profile.fcm_tokens as string[]
    const validTokens: string[] = []
    const invalidTokens: string[] = []

    // Send notifications to all tokens
    const sendPromises = tokens.map(async (token) => {
      try {
        await fcmAdmin.messaging().send({
          token,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: {
            ...payload.data,
            type: notificationType,
          },
          webpush: {
            notification: {
              title: payload.title,
              body: payload.body,
              icon: '/icons/icon-192x192.png',
            },
            fcmOptions: {
              link: payload.data?.postId ? `/posts/${payload.data.postId}` : '/',
            },
          },
        })
        validTokens.push(token)
      } catch (error: any) {
        // Handle invalid tokens
        if (error.code === 'messaging/invalid-registration-token' || 
            error.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(token)
        } else {
          console.error(`Failed to send notification to token ${token}:`, error)
        }
      }
    })

    await Promise.all(sendPromises)

    // Remove invalid tokens from database
    if (invalidTokens.length > 0) {
      const updatedTokens = tokens.filter((t) => !invalidTokens.includes(t))
      await supabase
        .from('user_profiles')
        .update({ fcm_tokens: updatedTokens })
        .eq('id', userId)
    }

    return {
      success: true,
      sent: validTokens.length,
      failed: invalidTokens.length,
      saved: true,
    }
  } catch (error: any) {
    console.error('Error sending notification:', error)
    return { success: false, error: error.message, saved: false }
  }
}

export async function sendCommentNotification(
  postId: string,
  commentId: string,
  commentAuthorId: string,
  postAuthorId: string
) {
  // Don't send notification if the comment author is the post author
  if (commentAuthorId === postAuthorId) {
    return { success: false, message: 'Comment author is post author' }
  }

  const supabase = createAdminClient()

  // Get post details
  const { data: post } = await supabase
    .from('posts')
    .select('title')
    .eq('id', postId)
    .single()

  // Get comment author details
  const { data: commentAuthor } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('id', commentAuthorId)
    .single()

  return sendNotificationToUser(postAuthorId, {
    title: '새 댓글이 달렸습니다',
    body: `${commentAuthor?.username || '익명'}님이 "${post?.title || '게시글'}"에 댓글을 남겼습니다.`,
    data: {
      type: 'comment',
      postId,
      commentId,
    },
  })
}

export async function sendReplyNotification(
  postId: string,
  commentId: string,
  replyAuthorId: string,
  parentCommentAuthorId: string
) {
  // Don't send notification if the reply author is the parent comment author
  if (replyAuthorId === parentCommentAuthorId) {
    return { success: false, message: 'Reply author is parent comment author' }
  }

  const supabase = createAdminClient()

  // Get post details
  const { data: post } = await supabase
    .from('posts')
    .select('title')
    .eq('id', postId)
    .single()

  // Get reply author details
  const { data: replyAuthor } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('id', replyAuthorId)
    .single()

  return sendNotificationToUser(parentCommentAuthorId, {
    title: '새 대댓글이 달렸습니다',
    body: `${replyAuthor?.username || '익명'}님이 "${post?.title || '게시글'}"의 댓글에 답글을 남겼습니다.`,
    data: {
      type: 'reply',
      postId,
      commentId,
    },
  })
}

export async function sendNewPostNotification(userIds: string[], postId: string, postTitle: string) {
  const sendPromises = userIds.map((userId) =>
    sendNotificationToUser(userId, {
      title: '새 게시글이 등록되었습니다',
      body: `"${postTitle}"`,
      data: {
        type: 'new_post',
        postId,
      },
    })
  )

  const results = await Promise.all(sendPromises)
  return results
}

