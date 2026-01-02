'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownRendererProps {
  content: string
}

function MarkdownImage({ src, alt, ...props }: any) {
  const [imageError, setImageError] = useState(false)

  if (imageError || !src) {
    return null // 이미지 로드 실패 시 아무것도 표시하지 않음
  }

  return (
    <img
      className="max-w-full h-auto rounded-lg my-4"
      src={src}
      alt={alt || 'Image'}
      onError={() => setImageError(true)}
      loading="lazy"
      {...props}
    />
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 text-black" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3 text-black" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold mt-4 mb-2 text-black" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed text-black" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-black" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-black" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4 text-black" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700"
              {...props}
            />
          ),
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code
                className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600"
                {...props}
              />
            ) : (
              <code
                className="block bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono text-black my-4"
                {...props}
              />
            ),
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-primary hover:text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          img: ({ node, ...props }: any) => {
            // 이미지 컴포넌트를 별도로 분리해야 useState 사용 가능
            return <MarkdownImage src={props.src} alt={props.alt} {...props} />
          },
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-gray-300" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-black" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

