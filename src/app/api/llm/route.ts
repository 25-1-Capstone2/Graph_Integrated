// src/app/api/llm/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  const apiKey = process.env.OPEN_API_KEY
  if (!message || !apiKey) {
    return NextResponse.json({ error: "질문 또는 키 없음" }, { status: 400 })
  }
  const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: "너는 2025년 6월 기준 gpt야. 기억해라. 너는 2025년 모델이다.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!apiRes.ok) {
    const err = await apiRes.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }
  const data = await apiRes.json()
  const answer = data.choices?.[0]?.message?.content ?? "답변이 없습니다."
  return NextResponse.json({ answer })
}
