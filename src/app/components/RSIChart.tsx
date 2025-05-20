'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Layout } from 'plotly.js'

// ✅ 동적 import (Plotly는 무겁기 때문에)
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <p>📉 RSI 차트 불러오는 중...</p>
})

type Props = {
  code: string
  companyName: string
}

type ChartItem = {
  Date: string
  RSI: number | null
}

export default function RSIChart({ code, companyName }: Props) {
  const [data, setData] = useState<ChartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:8000/chart?code=${code}`)
        if (!res.ok) throw new Error('RSI 데이터 조회 실패')
        const json = await res.json()
        const filtered = json
          .filter((d: any) => d.RSI !== null)
          .map((d: any) => ({ Date: d.Date, RSI: d.RSI }))
        setData(filtered)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchChart()
  }, [code])

  if (loading) return <p>📉 RSI 로딩 중...</p>
  if (error) return <p className="text-red-500">❌ {error}</p>
  if (data.length === 0) return <p>📭 RSI 데이터 없음</p>

  const date = data.map((d) => d.Date)
  const rsi = data.map((d) => d.RSI ?? null)

  const layout: Partial<Layout> = {
    title: { text: `${companyName} - RSI (14일)` },
    xaxis: { title: { text: '날짜' } },
    yaxis: {
      title: { text: 'RSI 값' },
      range: [0, 100]
    },
    shapes: [
      {
        type: 'line',
        xref: 'paper',
        x0: 0,
        x1: 1,
        y0: 70,
        y1: 70,
        line: { color: 'red', width: 1, dash: 'dot' }
      },
      {
        type: 'line',
        xref: 'paper',
        x0: 0,
        x1: 1,
        y0: 30,
        y1: 30,
        line: { color: 'blue', width: 1, dash: 'dot' }
      }
    ],
    margin: { t: 40, l: 50, r: 30, b: 50 },
    template: 'plotly_white' as any
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">📉 RSI 보조지표</h2>
      <Plot
        data={[
          {
            x: date,
            y: rsi,
            type: 'scatter',
            mode: 'lines',
            name: 'RSI',
            line: { color: 'darkorange' }
          }
        ]}
        layout={layout}
        useResizeHandler
        style={{ width: '100%', height: '400px' }}
        config={{ responsive: true }}
      />
    </div>
  )
}
