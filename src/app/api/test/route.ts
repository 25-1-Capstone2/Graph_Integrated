export const runtime = 'nodejs' // 반드시 최상단에 둘 것!

import { NextResponse } from 'next/server'

export async function GET() {
  console.log('✅ Node.js 로그 확인용')
  return NextResponse.json({ ok: true })
}