'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background-light min-h-screen flex items-center justify-center p-4 transition-colors duration-200">
      <div className="relative w-full max-w-[480px] flex flex-col gap-8">
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-3 text-black">
            <div className="size-10 bg-primary/20 flex items-center justify-center rounded-xl text-primary">
              <span className="material-symbols-outlined text-3xl">code</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight tracking-tight">TechTalk</h2>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl bg-card-light shadow-sm border border-slate-200 overflow-hidden p-6 sm:p-10">
          <div className="flex flex-col gap-2 mb-8 text-center">
            <h1 className="text-black text-3xl font-black leading-tight tracking-tight">환영합니다</h1>
            <p className="text-gray-700 text-base font-normal">개발자들과 소통하고 지식을 공유하세요.</p>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleLogin('google')}
              disabled={loading}
              className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-white text-gray-800 border border-slate-200 hover:bg-slate-50 transition-all duration-200 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
              </div>
              <span className="text-base font-semibold leading-normal">{loading ? '로그인 중...' : 'Google로 계속하기'}</span>
            </button>
            <button
              onClick={() => handleLogin('github')}
              disabled={loading}
              className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#24292e] text-white hover:opacity-90 transition-all duration-200 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 text-white">
                <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="text-base font-semibold leading-normal">{loading ? '로그인 중...' : 'GitHub로 계속하기'}</span>
            </button>
          </div>
          <div className="relative flex py-6 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-gray-600 text-xs font-medium uppercase">또는</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          <div className="text-center pt-2">
            <p className="text-gray-600 text-xs font-normal leading-relaxed">
              계속 진행 시 <a className="underline hover:text-black" href="#">이용약관</a> 및{' '}
              <a className="underline hover:text-black" href="#">개인정보 처리방침</a>에 동의하게 됩니다.
            </p>
          </div>
        </div>
        <div className="text-center">
          <a className="inline-flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors text-sm" href="#">
            <span className="material-symbols-outlined text-[18px]">help</span>
            <span>로그인에 도움이 필요하신가요?</span>
          </a>
        </div>
      </div>
    </div>
  )
}
