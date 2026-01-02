import Link from 'next/link'

interface PopularRankingProps {
  posts: Array<{
    id: string
    title: string
    view_count: number
  }>
}

export function PopularRanking({ posts }: PopularRankingProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        인기글이 없습니다
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {posts.map((post, index) => (
        <Link
          key={post.id}
          href={`/?post=${post.id}`}
          className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-black line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {post.title}
            </h4>
            <span className="text-xs text-gray-500 mt-0.5">
              조회수 {post.view_count || 0}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

