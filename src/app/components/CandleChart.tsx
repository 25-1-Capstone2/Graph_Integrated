'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Layout } from 'plotly.js'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <p>🕯️ 봉차트 불러오는 중...</p>
})

type Props = {
  code: string
  companyName: string
}

type CandleItem = {
  Date: string
  Open: number
  High: number
  Low: number
  Close: number
}[]

export default function CandleChart({ code, companyName }: Props) {
  const [data, setData] = useState<CandleItem>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${BASE_URL}/candle?code=${code}`)
        if (!res.ok) throw new Error('봉차트 데이터 요청 실패')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [code])

  if (loading) return <p>📊 봉차트 로딩 중...</p>
  if (error) return <p className="text-red-500">❌ {error}</p>
  if (data.length === 0) return <p>📭 데이터 없음</p>

  const date = data.map((d) => d.Date)
  const open = data.map((d) => d.Open)
  const high = data.map((d) => d.High)
  const low = data.map((d) => d.Low)
  const close = data.map((d) => d.Close)

  const layout: Partial<Layout> = {
    title: { text: `${companyName} - 최근 6개월 봉차트` },
    xaxis: { title: { text: '날짜' } },
    yaxis: { title: { text: '가격 (₩)' } },
    margin: { t: 40, l: 50, r: 30, b: 50 },
    template: 'plotly_white' as any
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">🕯️ 봉차트</h2>
      <Plot
        data={[
          {
            x: date,
            open: open,
            high: high,
            low: low,
            close: close,
            type: 'candlestick',
            name: '봉차트',
            increasing: { line: { color: 'red' } },
            decreasing: { line: { color: 'blue' } }
          }
        ]}
        layout={layout}
        useResizeHandler
        style={{ width: '100%', height: '450px' }}
        config={{ responsive: true }}
      />
    </div>
  )
}
