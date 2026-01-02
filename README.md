# 개발자 테크정보공유 게시판

Next.js 풀스택으로 구축된 개발자 테크정보공유 게시판입니다.

## 기술 스택

- **프론트엔드/백엔드**: Next.js 14+ (App Router)
- **인증**: Supabase Auth (Google, GitHub OAuth)
- **데이터베이스**: Supabase PostgreSQL
- **캐시/인기글**: Upstash Redis
- **푸시 알림**: Firebase Cloud Messaging (FCM)
- **PWA**: Service Worker + Web App Manifest
- **배포**: Vercel

## 주요 기능

- ✅ Google/GitHub 소셜 로그인
- ✅ 게시글 CRUD (작성, 조회, 수정, 삭제)
- ✅ 댓글/대댓글 시스템
- ✅ 조회수 카운트 (Redis 기반)
- ✅ 인기글 시스템 (Redis Sorted Set)
- ✅ FCM 푸시 알림 (댓글, 대댓글, 새 게시글)
- ✅ PWA 지원 (앱처럼 설치 가능)

## 설치 및 설정

### 1. 저장소 클론 및 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
# 또는 레거시 지원을 위해 NEXT_PUBLIC_SUPABASE_ANON_KEY 사용 가능
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Firebase Admin (FCM - 서버 사이드 푸시 전송)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Firebase Client (FCM - 클라이언트 사이드)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_public_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron (Vercel 배포 시)
CRON_SECRET=your_random_secret_string
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. SQL Editor에서 `supabase/schema.sql` 파일의 내용을 실행합니다.
3. Authentication > Providers에서 Google과 GitHub OAuth를 활성화하고 설정합니다.
4. Authentication > URL Configuration에서 Redirect URLs에 `http://localhost:3000/auth/callback`을 추가합니다.

### 4. Upstash Redis 설정

1. [Upstash](https://upstash.com)에서 Redis 데이터베이스를 생성합니다.
2. REST URL과 Token을 `.env.local`에 설정합니다.

### 5. Firebase 설정 (FCM)

1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트를 생성합니다.
2. Cloud Messaging을 활성화합니다.
3. 프로젝트 설정에서 웹 앱을 추가합니다.

**서버 사이드 설정 (Firebase Admin SDK):**

4. 프로젝트 설정 > 서비스 계정에서 새 비공개 키를 생성합니다.
5. 생성된 JSON 파일의 정보를 `.env.local`에 설정합니다:
   - `FIREBASE_PROJECT_ID`: project_id
   - `FIREBASE_PRIVATE_KEY`: private_key (줄바꿈 문자 포함, `\n` 형태로 설정)
   - `FIREBASE_CLIENT_EMAIL`: client_email

**클라이언트 사이드 설정 (Firebase SDK):**

6. 프로젝트 설정 > 일반에서 웹 앱의 구성 정보를 복사합니다.
7. `.env.local`에 Firebase 구성 정보를 설정합니다:

   - `NEXT_PUBLIC_FIREBASE_API_KEY`: apiKey
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: authDomain
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: projectId
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: storageBucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: messagingSenderId
   - `NEXT_PUBLIC_FIREBASE_APP_ID`: appId

8. Cloud Messaging에서 Web Push 인증서를 생성하고 VAPID 공개 키를 복사합니다.
9. `.env.local`에 VAPID 키를 설정합니다:
   - `NEXT_PUBLIC_FIREBASE_VAPID_KEY`: VAPID 공개 키

**참고:**

- 서버에서 FCM Admin SDK를 사용하여 푸시 알림을 전송합니다.
- 클라이언트에서 FCM 토큰을 등록하고 포그라운드/백그라운드 메시지를 수신합니다.
- 알림 내역은 Supabase에 저장되며, 사용자는 앱 내 알림 드롭다운에서 확인할 수 있습니다.

### 6. PWA 아이콘 생성

`public/icons/` 디렉토리에 다음 아이콘들을 추가하세요:

- `icon-192x192.png` (192x192 크기)
- `icon-512x512.png` (512x512 크기)

### 7. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Vercel 배포

### 1. GitHub에 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Vercel에 배포

1. [Vercel](https://vercel.com)에 로그인합니다.
2. 새 프로젝트를 생성하고 GitHub 저장소를 연결합니다.
3. **환경 변수 설정** (Project Settings > Environment Variables):

   - 아래 체크리스트의 모든 환경 변수를 설정합니다.
   - Production, Preview, Development 환경에 적용할지 선택합니다.

   **⚠️ 보안 주의사항:**

   - `NEXT_PUBLIC_*`로 시작하는 변수들은 **클라이언트 번들에 포함**되어 브라우저에서 볼 수 있습니다. 이는 의도된 동작이며 Firebase 설정과 VAPID 공개 키는 공개되어도 안전합니다.
   - `SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `UPSTASH_*`, `CRON_SECRET` 등은 **서버 사이드 전용**입니다. Vercel 환경 변수로 설정하면 서버에서만 접근 가능하며, 클라이언트 코드에는 노출되지 않습니다.
   - **Firebase Admin SDK 환경 변수 주의사항:**
     - `FIREBASE_PRIVATE_KEY`: JSON 파일의 `private_key` 값을 복사할 때, 줄바꿈 문자(`\n`)가 포함되어야 합니다. Vercel 환경 변수에 설정할 때는 `\n`을 그대로 입력하거나, JSON 파일의 전체 값(따옴표 포함)을 입력할 수 있습니다.
     - `FIREBASE_PROJECT_ID`와 `FIREBASE_CLIENT_EMAIL`은 서버 전용이므로 반드시 Vercel 환경 변수로만 설정하세요.
   - **절대로** `.env.local` 파일을 Git에 커밋하거나 공개 저장소에 업로드하지 마세요. (이미 `.gitignore`에 추가되어 있습니다)

4. `CRON_SECRET` 환경 변수를 랜덤 문자열로 생성하여 설정합니다:

   ```bash
   # 터미널에서 랜덤 문자열 생성
   openssl rand -hex 32
   ```

5. 배포를 시작합니다.

**환경 변수 체크리스트:**

- ✅ `NEXT_PUBLIC_SUPABASE_URL` (공개)
- ✅ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (공개)
- 🔒 `SUPABASE_SERVICE_ROLE_KEY` (서버 전용)
- 🔒 `UPSTASH_REDIS_REST_URL` (서버 전용)
- 🔒 `UPSTASH_REDIS_REST_TOKEN` (서버 전용)
- 🔒 `FIREBASE_PROJECT_ID` (서버 전용)
- 🔒 `FIREBASE_PRIVATE_KEY` (서버 전용, 가장 중요!)
- 🔒 `FIREBASE_CLIENT_EMAIL` (서버 전용)
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY` (공개)
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (공개)
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (공개)
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (공개)
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (공개)
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID` (공개)
- ✅ `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (공개, VAPID는 공개 키)
- ✅ `NEXT_PUBLIC_APP_URL` (공개)
- 🔒 `CRON_SECRET` (서버 전용)

**범례:**

- ✅ = 클라이언트에 노출되어도 안전 (브라우저 개발자 도구에서 볼 수 있음)
- 🔒 = 서버 전용, Vercel 환경 변수로 설정하면 안전하게 보호됨

### 3. Supabase Redirect URL 업데이트

Vercel 배포 후, Supabase의 Redirect URLs에 배포된 URL을 추가합니다:

- `https://your-domain.vercel.app/auth/callback`

### 4. Cron Job 설정

`vercel.json`에 정의된 Cron Job이 자동으로 실행됩니다:

- 조회수 동기화: 매 시간 (`/api/cron/sync-views`)

## 프로젝트 구조

```
tech-board/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 라우트
│   ├── (main)/              # 메인 라우트
│   ├── api/                 # API 라우트
│   └── manifest.ts          # PWA manifest
├── components/              # React 컴포넌트
├── lib/                     # 유틸리티 및 클라이언트
│   ├── supabase/           # Supabase 클라이언트
│   ├── redis/              # Redis 클라이언트
│   └── fcm/                # FCM 알림
├── public/                  # 정적 파일
│   └── sw.js               # Service Worker
├── supabase/               # Supabase 스키마
└── types/                  # TypeScript 타입
```

## 라이센스

MIT
