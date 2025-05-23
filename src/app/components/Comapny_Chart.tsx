'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Layout } from 'plotly.js'

// ✅ loading 없앰 (flicker 방지용)
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => null
})

type Props = {
  code: string | null
  companyName: string
}

type CandleItem = {
  Date: string
  Open: number
  High: number
  Low: number
  Close: number
}

export default function CombinedChart({ code, companyName }: Props) {
  const [data, setData] = useState<CandleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:8000/combined?code=${code}`)
        if (!res.ok) throw new Error('차트 데이터 조회 실패')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchChart()
  }, [code])

  if (loading) return <p>📊 차트 로딩 중...</p>
  if (error) return <p className="text-red-500">❌ {error}</p>
  if (data.length === 0) return <p>📭 데이터 없음</p>

  const date = data.map((d) => d.Date)
  const open = data.map((d) => d.Open)
  const high = data.map((d) => d.High)
  const low = data.map((d) => d.Low)
  const close = data.map((d) => d.Close)

  const layout: Partial<Layout> = {
    title: { text: `${companyName}` },
    autosize: true,
    margin: { t: 40, l: 50, r: 30, b: 50 },
    xaxis: {
      title: { text: '날짜' },
      rangeslider: { visible: false }
    },
    yaxis: { title: { text: '가격 (₩)' } },
    legend: { orientation: 'h' },
    template: 'plotly_white' as any
  }

  return (
    // ✅ min-height 추가: 깜빡임 방지 + 반응형 지원
    <div className="flex-1 w-full overflow-hidden min-h-[400px]">
      <Plot
        // ✅ key 제거: 불필요한 재마운트 방지
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
          },
          {
            x: date,
            y: close,
            type: 'scatter',
            mode: 'lines',
            name: '종가',
            line: { color: '#555', width: 1.5, dash: 'dot' }
          }
        ]}
        layout={layout}
        config={{ responsive: true }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }} // ✅ 부모 크기 기반
      />
    </div>
  )
}
