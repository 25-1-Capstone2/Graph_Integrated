'use client'

import { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'
import { Layout } from 'plotly.js'

type Props = {
  code: string
  companyName: string
}

type ChartItem = {
  Date: string
  Close: number
  MA5: number | null
  MA20: number | null
  MA60: number | null
  MA120: number | null
}

export default function MaChart({ code, companyName }: Props) {
  const [data, setData] = useState<ChartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:8000/chart?code=${code}`)
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

  if (loading) return <p>📊 이동평균선 로딩 중...</p>
  if (error) return <p className="text-red-500">❌ {error}</p>
  if (data.length === 0) return <p>📭 데이터 없음</p>

  const date = data.map((d) => d.Date)
  const close = data.map((d) => d.Close)
  const ma5 = data.map((d) => d.MA5 ?? null)
  const ma20 = data.map((d) => d.MA20 ?? null)
  const ma60 = data.map((d) => d.MA60 ?? null)
  const ma120 = data.map((d) => d.MA120 ?? null)

  const layout: Partial<Layout> = {
    title: { text: `${companyName} - 10년 이동평균선 + 종가 차트` },
    xaxis: { title: { text: '날짜' } },
    yaxis: { title: { text: '가격 (₩)' } },
    margin: { t: 40, l: 50, r: 30, b: 50 },
    template: 'plotly_white' as any
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">📈 이동평균선 차트</h2>
      <Plot
        data={[
          { x: date, y: close, type: 'scatter', mode: 'lines', name: '종가' },
          { x: date, y: ma5, type: 'scatter', mode: 'lines', name: 'MA5' },
          { x: date, y: ma20, type: 'scatter', mode: 'lines', name: 'MA20' },
          { x: date, y: ma60, type: 'scatter', mode: 'lines', name: 'MA60' },
          { x: date, y: ma120, type: 'scatter', mode: 'lines', name: 'MA120' }
        ]}
        layout={layout}
        useResizeHandler
        style={{ width: '100%', height: '450px' }}
      />
    </div>
  )
}
