'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Layout } from 'plotly.js'

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

  // 최근 1년(252개)만
  const recent = data.length > 252 ? data.slice(-252) : data
  const date = recent.map((d) => d.Date)
  const rsi = recent.map((d) => d.RSI ?? null)

  const layout: Partial<Layout> = {
    autosize: true,
    height: 420, // 세로 더 길게!
    showlegend: false,
    margin: { t: 10, l: 28, r: 20, b: 28 },
    title: '',
    xaxis: {
      gridcolor: '#f3f4f6',
      showgrid: true,
      tickfont: { size: 12, color: "#ff7300" },
      automargin: true,
      zeroline: false,
      rangemode: "tozero",
      range: [date[0], date[date.length - 1]],
    },
    yaxis: {
      gridcolor: '#f3f4f6',
      showgrid: true,
      tickfont: { size: 12, color: "#ff7300" },
      range: [0, 100],
      side: 'right',
      zeroline: false,
      automargin: true,
    },
    shapes: [
      {
        type: 'line',
        xref: 'paper',
        x0: 0, x1: 1,
        y0: 70, y1: 70,
        line: { color: '#ef4444', width: 1.5, dash: 'dash' }
      },
      {
        type: 'line',
        xref: 'paper',
        x0: 0, x1: 1,
        y0: 30, y1: 30,
        line: { color: '#3b82f6', width: 1.5, dash: 'dash' }
      },
    ],
    annotations: [
      {
        xref: 'paper', yref: 'y', x: 1.01, y: 70,
        text: '70 (과매수)', showarrow: false,
        font: { color: '#ef4444', size: 11 }
      },
      {
        xref: 'paper', yref: 'y', x: 1.01, y: 30,
        text: '30 (과매도)', showarrow: false,
        font: { color: '#3b82f6', size: 11 }
      },
    ],
    plot_bgcolor: "#fff",
    paper_bgcolor: "#fff",
    hovermode: "x unified",
    hoverlabel: {
      bgcolor: "#0f172a",
      bordercolor: "#0f172a",
      font: { color: "#fff", size: 11 },
    },
  }

  return (
    <div className="w-full" style={{ margin: 0, padding: 0 }}>
      <Plot
        data={[
          {
            x: date,
            y: rsi,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'RSI',
            line: { color: '#ff7300', width: 3, shape: "spline" }, // 쨍한 오렌지
            marker: { size: 4, color: '#ff7300' },
            hovertemplate:
              "RSI: %{y:.2f}<br>날짜: %{x}<extra></extra>"
          }
        ]}
        layout={layout}
        useResizeHandler
        style={{ width: '100%', height: '420px', margin: 0, padding: 0 }}
        config={{ responsive: true, displayModeBar: false }}
      />
    </div>
  )
}
