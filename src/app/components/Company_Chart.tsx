"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Layout } from "plotly.js"
import { Loader2, AlertCircle, TrendingUp } from "lucide-react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// 클라이언트 전용 Plotly
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
      <p className="text-gray-600 font-medium">차트 불러오는 중...</p>
    </div>
  ),
})

type Props = {
  code: string
  companyName: string
}

type ChartItem = {
  Date: string
  Open: number
  High: number
  Low: number
  Close: number
  MA5: number | null
  MA20: number | null
  MA60: number | null
  MA120: number | null
}

export default function Company_Chart({ code, companyName }: Props) {
  const [data, setData] = useState<ChartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    const fetchChart = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${BASE_URL}/combined?code=${code}`)
        if (!res.ok) throw new Error("차트 데이터 조회 실패")
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <div className="text-center">
          <p className="text-gray-700 font-medium text-lg">차트 로딩 중...</p>
          <p className="text-gray-500 text-sm mt-1">{companyName} 데이터를 가져오고 있습니다</p>
        </div>
      </div>
    )
  if (error)
    return (
      <div className="flex items-center justify-center h-96 bg-red-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium text-lg">데이터 로드 실패</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  if (data.length === 0)
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">데이터 없음</p>
          <p className="text-gray-500 text-sm mt-1">선택한 종목의 차트 데이터가 없습니다</p>
        </div>
      </div>
    )

  // 최근 6개월(110영업일)만 보여주기
  const last110 = data.length > 110 ? data.slice(-110) : data

  const date = last110.map((d) => d.Date)
  const open = last110.map((d) => d.Open)
  const high = last110.map((d) => d.High)
  const low = last110.map((d) => d.Low)
  const close = last110.map((d) => d.Close)
  const ma5 = last110.map((d) => d.MA5 ?? null)
  const ma20 = last110.map((d) => d.MA20 ?? null)
  const ma60 = last110.map((d) => d.MA60 ?? null)
  const ma120 = last110.map((d) => d.MA120 ?? null)

  // ====== 종가 기울기 구간별 색상 분할 ======
  type LineSegment = { x: string[], y: number[], color: string }
  const closeSegments: LineSegment[] = []
  if (close.length > 1) {
    let segX: string[] = [date[0]]
    let segY: number[] = [close[0]]
    let prevColor = close[1] >= close[0] ? "red" : "blue"
    for (let i = 1; i < close.length; i++) {
      const nowColor = close[i] >= close[i - 1] ? "red" : "blue"
      if (nowColor === prevColor) {
        segX.push(date[i])
        segY.push(close[i])
      } else {
        closeSegments.push({ x: [...segX], y: [...segY], color: prevColor })
        segX = [date[i - 1], date[i]]
        segY = [close[i - 1], close[i]]
        prevColor = nowColor
      }
    }
    closeSegments.push({ x: segX, y: segY, color: prevColor })
  }

  const layout: Partial<Layout> = {
    autosize: true,
    showlegend: true,
    legend: {
      orientation: "h",
      x: 0,
      y: 1.1,
      font: { size: 12 },
      bgcolor: "rgba(255,255,255,0.9)",
    },
    xaxis: {
      gridcolor: "#f1f5f9",
      showgrid: true,
      zeroline: false,
      tickfont: { size: 11, color: "#374151" },
    },
    yaxis: {
      gridcolor: "#f1f5f9",
      showgrid: true,
      zeroline: false,
      tickfont: { size: 11, color: "#374151" },
      side: "right",
      tickformat: ",.0f",
    },
    margin: { t: 20, l: 15, r: 30, b: 30 },
    plot_bgcolor: "white",
    paper_bgcolor: "white",
    font: { family: "Inter, system-ui, sans-serif" },
    hovermode: "x unified",
    hoverlabel: {
      bgcolor: "#0f172a",
      bordercolor: "#0f172a",
      font: { color: "#fff", size: 11 },
    },
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1">
        <Plot
          data={[
            {
              x: date,
              open,
              high,
              low,
              close,
              type: "candlestick",
              name: "캔들스틱",
              increasing: { line: { color: "#ef4444", width: 1 } },
              decreasing: { line: { color: "#3b82f6", width: 1 } },
              hovertemplate:
                "<b>%{x}</b><br>" +
                "시가: %{open:,.0f}<br>" +
                "고가: %{high:,.0f}<br>" +
                "저가: %{low:,.0f}<br>" +
                "종가: %{close:,.0f}<br>" +
                "<extra></extra>",
            },
            // 종가 색상 분할된 trace 삽입
            ...closeSegments.map((seg, idx) => ({
              x: seg.x,
              y: seg.y,
              type: "scatter",
              mode: "lines",
              name: idx === 0 ? "종가" : undefined,
              line: { color: seg.color, width: 2 },
              hovertemplate: "종가: %{y:,.0f}<extra></extra>",
              showlegend: idx === 0, // 첫 번째만 legend에 표시
            })),
            // 이동평균선 - 기본 숨김 (legendonly)
            {
              x: date,
              y: ma5,
              type: "scatter",
              mode: "lines",
              name: "MA5",
              line: { width: 2, color: "#22d3ee" },
              hovertemplate: "MA5: %{y:,.0f}<extra></extra>",
              connectgaps: false,
              visible: "legendonly",
            },
            {
              x: date,
              y: ma20,
              type: "scatter",
              mode: "lines",
              name: "MA20",
              line: { width: 2, color: "#a3e635" },
              hovertemplate: "MA20: %{y:,.0f}<extra></extra>",
              connectgaps: false,
              visible: "legendonly",
            },
            {
              x: date,
              y: ma60,
              type: "scatter",
              mode: "lines",
              name: "MA60",
              line: { width: 2, color: "#fbbf24" },
              hovertemplate: "MA60: %{y:,.0f}<extra></extra>",
              connectgaps: false,
              visible: "legendonly",
            },
            {
              x: date,
              y: ma120,
              type: "scatter",
              mode: "lines",
              name: "MA120",
              line: { width: 2, color: "#f472b6" },
              hovertemplate: "MA120: %{y:,.0f}<extra></extra>",
              connectgaps: false,
              visible: "legendonly",
            },
          ]}
          layout={layout}
          useResizeHandler
          style={{
            width: "100%",
            height: "400px",
          }}
          config={{
            responsive: true,
            displayModeBar: false,
          }}
        />
      </div>
    </div>
  )
}
