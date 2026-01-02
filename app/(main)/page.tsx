import Link from 'next/link'
import { FloatingWriteButton } from '@/components/layout/FloatingWriteButton'
import { PostDetailModalWrapper } from '@/components/posts/PostDetailModalWrapper'
import { PostFeed } from '@/components/posts/PostFeed'
import { PopularRanking } from '@/components/posts/PopularRanking'

async function getPopularPosts() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/posts/popular?limit=10`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return []
    }

    const posts = await response.json()
    // 제목과 조회수만 반환
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      view_count: post.view_count || 0,
    }))
  } catch (error) {
    console.error('Error fetching popular posts:', error)
    return []
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>
}) {
  const params = await searchParams
  const popularPosts = await getPopularPosts()

  return (
    <div className="bg-background-light text-black font-display min-h-screen flex flex-col overflow-x-hidden relative">
      <div className="flex flex-1 max-w-[1200px] w-full mx-auto px-0 sm:px-4 lg:px-10 py-6 gap-8">
        <main className="flex flex-col flex-1 max-w-[640px] mx-auto w-full gap-6">
          <PostFeed />
        </main>
        <aside className="hidden xl:flex flex-col w-80 shrink-0 sticky top-[88px] h-fit gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-4">
            <Link 
              href="/popular"
              className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity cursor-pointer group"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">local_fire_department</span>
              <h3 className="text-black font-bold text-base group-hover:text-primary transition-colors">실시간 인기글</h3>
              <span className="material-symbols-outlined text-gray-400 text-[18px] ml-auto group-hover:text-primary transition-colors">arrow_forward</span>
            </Link>
            <PopularRanking posts={popularPosts} />
          </div>
        </aside>
      </div>
      <FloatingWriteButton />
      <PostDetailModalWrapper postId={params.post} />
    </div>
  )
}
