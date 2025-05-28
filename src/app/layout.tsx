import './globals.css'
import 'tailwindcss/tailwind.css'
import { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-black">
        {children}
      </body>
    </html>
  )
}
