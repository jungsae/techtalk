importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase 설정은 클라이언트에서 주입받아야 함
// Service Worker는 별도 컨텍스트이므로 직접 환경 변수 접근 불가

let messagingInstance = null;
let isInitialized = false;

function initializeFirebase(firebaseConfig) {
  if (isInitialized && messagingInstance) {
    return messagingInstance;
  }

  try {
    // 이미 초기화된 앱이 있으면 재사용
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    
    messagingInstance = firebase.messaging();
    isInitialized = true;

    // 배경 메시지 핸들러 등록
    messagingInstance.onBackgroundMessage((payload) => {
      const notificationTitle = payload.notification?.title || '알림';
      const notificationBody = payload.notification?.body || '';
      const data = payload.data || {};
      
      // 포그라운드로 메시지 전달 (포그라운드가 열려있는 경우)
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'FCM_NOTIFICATION',
            payload: payload,
          });
        });
      }).catch((err) => {
        // 클라이언트에 메시지 전달 실패해도 계속 진행
      });
      
      const notificationOptions = {
        body: notificationBody,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: data.postId || 'notification',
        data: data,
        requireInteraction: false,
      };

      return self.registration.showNotification(notificationTitle, notificationOptions);
    });

    return messagingInstance;
  } catch (error) {
    // 초기화 실패 시 null 반환
    return null;
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    const firebaseConfig = event.data.config;
    initializeFirebase(firebaseConfig);
  }
});

// 알림 클릭 시 페이지 열기
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  let url = '/';
  
  if (data.postId) {
    url = `/posts/${data.postId}`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열려있는 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // 새 탭 열기
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

