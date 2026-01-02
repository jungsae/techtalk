import Link from 'next/link'
import { FloatingWriteButton } from '@/components/layout/FloatingWriteButton'
import { PostDetailModalWrapper } from '@/components/posts/PostDetailModalWrapper'
import { MyPostFeed } from '@/components/posts/MyPostFeed'

export default async function MyPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>
}) {
  const params = await searchParams

  return (
    <div className="bg-background-light text-black font-display min-h-screen flex flex-col pb-16 sm:pb-0">
      <div className="flex flex-1 max-w-[1200px] w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 gap-4 sm:gap-6 lg:gap-8">
        <main className="flex flex-col flex-1 w-full">
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">내 게시글</h1>
            <Link
              href="/"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors text-xs sm:text-sm font-medium touch-manipulation whitespace-nowrap"
            >
              목록으로
            </Link>
          </div>

          <MyPostFeed />
        </main>
      </div>
      <FloatingWriteButton />
      <PostDetailModalWrapper postId={params.post} />
    </div>
  )
}

