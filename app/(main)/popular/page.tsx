import Link from 'next/link'
import { FloatingWriteButton } from '@/components/layout/FloatingWriteButton'
import { PostCard } from '@/components/posts/PostCard'
import { PostDetailModalWrapper } from '@/components/posts/PostDetailModalWrapper'

async function getPopularPosts() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/posts/popular?limit=20`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    return []
  }

  return response.json()
}

export default async function PopularPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>
}) {
  const params = await searchParams
  const posts = await getPopularPosts()

  return (
    <div className="bg-background-light text-black font-display min-h-screen flex flex-col pb-16 sm:pb-0">
      <div className="flex flex-1 max-w-[1200px] w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 gap-4 sm:gap-6 lg:gap-8">
        <main className="flex flex-col flex-1 w-full">
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-black">인기글</h1>
            <Link
              href="/"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors text-xs sm:text-sm font-medium touch-manipulation whitespace-nowrap"
            >
              목록으로
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">아직 인기글이 없습니다</p>
              <p className="text-sm">게시글을 작성하고 조회수를 올려보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} variant="popular" />
              ))}
            </div>
          )}
        </main>
      </div>
      <FloatingWriteButton />
      <PostDetailModalWrapper postId={params.post} />
    </div>
  )
}
