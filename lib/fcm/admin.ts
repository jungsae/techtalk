import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

  // Firebase 환경 변수가 없으면 초기화하지 않음 (FCM 기능 비활성화)
  if (projectId && privateKey && clientEmail) {
    try {
      // Private key 처리: 여러 형태의 줄바꿈 문자 처리
      let processedPrivateKey = privateKey.trim()
      
      // JSON에서 복사한 경우 따옴표 제거
      if (processedPrivateKey.startsWith('"') && processedPrivateKey.endsWith('"')) {
        processedPrivateKey = processedPrivateKey.slice(1, -1)
      }
      
      // 이스케이프된 줄바꿈 처리 (여러 형태 지원)
      // 1. \\n (이중 이스케이프) - 가장 일반적인 경우
      // 2. \n (단일 이스케이프)
      // 3. 실제 줄바꿈은 그대로 유지
      processedPrivateKey = processedPrivateKey
        .replace(/\\\\n/g, '\\n') // 삼중 이스케이프 먼저 처리
        .replace(/\\n/g, '\n') // 이중 이스케이프된 줄바꿈 → 실제 줄바꿈
        .replace(/"/g, '') // 따옴표 제거 (남아있는 경우)

      // PEM 형식 검증 (시작과 끝 체크)
      if (!processedPrivateKey.includes('-----BEGIN') || !processedPrivateKey.includes('-----END')) {
        console.error('FIREBASE_PRIVATE_KEY 형식 오류:')
        console.error(`- Private key 길이: ${processedPrivateKey.length} 문자`)
        console.error(`- 첫 50자: ${processedPrivateKey.substring(0, 50)}`)
        console.error(`- 마지막 50자: ${processedPrivateKey.substring(Math.max(0, processedPrivateKey.length - 50))}`)
        throw new Error('Invalid private key format: must be PEM formatted (should contain -----BEGIN and -----END)')
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: processedPrivateKey,
          clientEmail,
        }),
      })
      console.log('Firebase Admin SDK initialized successfully.')
    } catch (error: any) {
      console.error('Firebase Admin 초기화 실패:', error.message)
      console.error('Private key 처리 오류. 환경 변수 FIREBASE_PRIVATE_KEY를 확인하세요.')
      console.error('')
      console.error('올바른 설정 방법:')
      console.error('1. Firebase Console > 프로젝트 설정 > 서비스 계정')
      console.error('2. "새 비공개 키 생성" 클릭하여 JSON 파일 다운로드')
      console.error('3. JSON 파일에서 private_key 값 복사')
      console.error('4. .env.local 파일에 다음과 같이 설정:')
      console.error('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"')
      console.error('   또는 실제 줄바꿈을 유지한 채로:')
      console.error('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"')
      console.error('')
      // 초기화 실패해도 앱은 계속 실행 (FCM 기능만 비활성화)
    }
  } else {
    if (!projectId) console.warn('FIREBASE_PROJECT_ID 환경 변수가 설정되지 않았습니다.')
    if (!privateKey) console.warn('FIREBASE_PRIVATE_KEY 환경 변수가 설정되지 않았습니다.')
    if (!clientEmail) console.warn('FIREBASE_CLIENT_EMAIL 환경 변수가 설정되지 않았습니다.')
    console.warn('Firebase Admin SDK 환경 변수가 설정되지 않았습니다. FCM 푸시 알림이 비활성화됩니다.')
  }
}

export const fcmAdmin = admin

