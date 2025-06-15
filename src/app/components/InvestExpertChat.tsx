"use client"

import { useState, useRef, useEffect } from "react"
import { Loader2, Send } from "lucide-react"

export default function InvestExpertChat() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim()) return
    setMessages((msgs) => [...msgs, { role: "user", content: input }])
    setLoading(true)
    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      setMessages((msgs) => [...msgs, { role: "assistant", content: data.answer }])
    } catch (e) {
      setMessages((msgs) => [...msgs, { role: "assistant", content: "오류가 발생했습니다." }])
    } finally {
      setLoading(false)
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[500px] min-h-[400px] bg-white border rounded-none shadow p-6">
      <h2 className="text-lg font-bold mb-3 text-emerald-600">ChatGpt4.1</h2>
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 px-1">
        {messages.length === 0 && (
          <div className="text-gray-400 text-sm text-center pt-16 pb-8">아래에 투자/주식 관련 질문을 입력해보세요.</div>
        )}
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="text-right mb-2">
              <div className="inline-block bg-emerald-50 text-emerald-800 rounded-xl px-3 py-2 max-w-[80%] text-sm">{msg.content}</div>
            </div>
          ) : (
            <div key={i} className="text-left mb-2">
              <div className="inline-block bg-slate-50 text-slate-900 rounded-xl px-3 py-2 max-w-[80%] text-sm whitespace-pre-line">{msg.content}</div>
            </div>
          )
        )}
        {loading && (
          <div className="flex items-center text-gray-400 text-sm mt-2">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            답변 생성 중...
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <textarea
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="궁금한 투자/주식 관련 질문을 입력하세요."
          className="flex-1 resize-none border rounded-none px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-none flex items-center gap-1 font-semibold disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
