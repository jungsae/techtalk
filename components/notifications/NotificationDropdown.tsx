'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  related_post_id: string | null
  related_comment_id: string | null
  is_read: boolean
  created_at: string
}

export function NotificationDropdown({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()

    // FCM 알림 수신 시 목록 새로고침
    const handleFCMNotification = () => {
      fetchNotifications()
    }
    window.addEventListener('fcm-notification-received', handleFCMNotification)

    // Service Worker에서 전달받은 메시지도 처리
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'FCM_NOTIFICATION') {
        fetchNotifications()
      }
    }
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)

    // 주기적으로 알림 목록 새로고침 (2분마다 - Upstash 사용량 최적화)
    const intervalId = setInterval(() => {
      fetchNotifications()
    }, 120000)

    // 페이지 포커스 시 알림 목록 새로고침
    const handleFocus = () => {
      fetchNotifications()
    }
    window.addEventListener('focus', handleFocus)

    // 페이지 가시성 변경 시에도 새로고침 (탭 전환 등)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('fcm-notification-received', handleFCMNotification)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage)
      clearInterval(intervalId)
    }
  }, [userId])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, isRead: true }),
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      // 삭제된 알림이 읽지 않았던 경우 unreadCount 감소
      const deletedNotification = notifications.find((n) => n.id === notificationId)
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.related_post_id) {
      return `/posts/${notification.related_post_id}`
    }
    return '/'
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`
    return notifDate.toLocaleDateString('ko-KR')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            fetchNotifications()
          }
        }}
        className="relative flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-black touch-manipulation"
        aria-label="알림"
      >
        <span className="material-symbols-outlined text-[20px] sm:text-[24px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-xl shadow-lg border border-[#e5e7eb] z-50 max-h-[500px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb]">
            <h3 className="text-lg font-bold text-black">알림</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:text-blue-600 transition-colors"
              >
                모두 읽음 처리
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                알림을 불러오는 중...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                알림이 없습니다
              </div>
            ) : (
              <div className="divide-y divide-[#e5e7eb]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group relative p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <Link
                      href={getNotificationLink(notification)}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id)
                        }
                        setIsOpen(false)
                      }}
                      className="block"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          {!notification.is_read && (
                            <div className="size-2 rounded-full bg-primary mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black mb-1">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => deleteNotification(notification.id, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                      aria-label="알림 삭제"
                      title="삭제"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

