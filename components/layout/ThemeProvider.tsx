'use client'

import { ReactNode } from 'react'

// 다크 모드 제거 - 라이트 모드만 사용
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
