'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getFirebaseMessaging, requestForToken, onForegroundMessage } from '@/lib/firebase/config'

export function FCMProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      // Service Worker가 준비될 때까지 대기
      navigator.serviceWorker.ready.then((registration) => {
        // Firebase 설정을 Service Worker에 전달
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        }
        
        if (firebaseConfig.apiKey) {
          // 활성화된 Service Worker에 설정 전달
          if (registration.active) {
            registration.active.postMessage({
              type: 'FIREBASE_CONFIG',
              config: firebaseConfig,
            })
          }
          
          // 대기 중인 Service Worker에도 설정 전달
          if (registration.waiting) {
            registration.waiting.postMessage({
              type: 'FIREBASE_CONFIG',
              config: firebaseConfig,
            })
          }
          
          // 새로 설치되는 Service Worker에도 설정 전달
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated' && newWorker.active) {
                  newWorker.active.postMessage({
                    type: 'FIREBASE_CONFIG',
                    config: firebaseConfig,
                  })
                }
              })
            }
          })
        }

        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            requestForToken(registration).then((token) => {
              if (token) {
                registerFCMToken(token)
              }
            })

            // 포그라운드 메시지 리스너
            onForegroundMessage((payload) => {
              handleNotificationReceived(payload)
            })

            // Service Worker에서 전달받은 메시지 리스너 (백그라운드에서 포그라운드로 돌아왔을 때)
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data && event.data.type === 'FCM_NOTIFICATION') {
                handleNotificationReceived(event.data.payload)
              }
            })
          } else {
            // 알림 권한이 거부된 경우 조용히 처리 (개발 환경에서만 경고)
            if (process.env.NODE_ENV === 'development') {
              console.warn('Notification permission denied.')
            }
          }
        })
      })

      // Firebase Messaging Service Worker 등록
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .catch((error) => {
          console.error('Error registering Firebase Messaging service worker:', error)
        })
    }
  }, [])

  const handleNotificationReceived = (payload: any) => {
    const { notification, data } = payload
    
    // 포그라운드에서 브라우저 알림 표시
    if (notification) {
      new Notification(notification.title || '알림', {
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        tag: data?.postId || 'notification',
        data: data,
      })
    }
    
    // 알림 드롭다운 새로고침 (커스텀 이벤트 발생)
    window.dispatchEvent(new CustomEvent('fcm-notification-received', { detail: payload }))
  }

  const registerFCMToken = async (token: string) => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await fetch('/api/notifications/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
    } catch (error) {
      console.error('Error registering FCM token:', error)
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

