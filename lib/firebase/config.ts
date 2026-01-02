import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
}

let app
let messagingInstance: ReturnType<typeof getMessaging> | null = null

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig)
    messagingInstance = getMessaging(app)
  } catch (error) {
    console.error('Firebase 초기화 실패:', error)
  }
} else if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
  console.warn('Firebase 환경 변수가 설정되지 않았습니다. FCM 기능이 비활성화됩니다.')
}

export const getFirebaseMessaging = () => messagingInstance

export const requestForToken = async (
  serviceWorkerRegistration: ServiceWorkerRegistration,
): Promise<string | null> => {
  const messaging = getFirebaseMessaging()
  if (!messaging) return null

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration,
    })
    if (token) {
      // FCM 토큰은 보안상 콘솔에 출력하지 않음
      return token
    } else {
      console.warn(
        '등록된 Firebase 토큰이 없습니다. 권한을 요청해 토큰을 생성하세요.',
      )
      return null
    }
  } catch (error) {
    console.error('토큰을 가져오는 중 오류가 발생했습니다. ', error)
    return null
  }
}

export const onForegroundMessage = (callback: (payload: any) => void) => {
  const messaging = getFirebaseMessaging()
  if (messaging) {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)
      callback(payload)
    })
  }
}

