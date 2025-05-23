import './globals.css'
import { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-black"> {/* ✅ 높이 설정 추가 */}
        {children}
      </body>
    </html>
  )
}
