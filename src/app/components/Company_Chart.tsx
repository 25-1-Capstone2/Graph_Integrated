"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { Layout } from "plotly.js"
import { Loader2, AlertCircle, TrendingUp } from "lucide-react"

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p className="text-gray-600 font-medium">차트 불러오는 중...</p>
      </div>
    </div>
  ),
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
  MA5?: number | null
  MA20?: number | null
  MA60?: number | null
  MA120?: number | null
}

export default function CombinedChart({ code, companyName }: Props) {
  const [data, setData] = useState<CandleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`http://localhost:8000/combined?code=${code}`)
        if (!res.ok) throw new Error("차트 데이터 조회 실패")
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    if (code) {
      fetchChart()
    }
  }, [code])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg m-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium text-lg">차트 로딩 중...</p>
          <p className="text-gray-500 text-sm mt-1">{companyName} 데이터를 가져오고 있습니다</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg m-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium text-lg">데이터 로드 실패</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg m-4">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">데이터 없음</p>
          <p className="text-gray-500 text-sm mt-1">선택한 종목의 차트 데이터가 없습니다</p>
        </div>
      </div>
    )
  }

  const date = data.map((d) => d.Date)
  const open = data.map((d) => d.Open)
  const high = data.map((d) => d.High)
  const low = data.map((d) => d.Low)
  const close = data.map((d) => d.Close)
  const ma5 = data.map((d) => d.MA5 ?? null)
  const ma20 = data.map((d) => d.MA20 ?? null)
  const ma60 = data.map((d) => d.MA60 ?? null)
  const ma120 = data.map((d) => d.MA120 ?? null)

  const layout: Partial<Layout> = {
    autosize: true,
    showlegend: true,
    legend: {
      orientation: "h",
      x: 0,
      y: 1.02,
      bgcolor: "rgba(255,255,255,0.8)",
      bordercolor: "rgba(0,0,0,0.1)",
      borderwidth: 1,
      font: { size: 11 },
    },
    xaxis: {
      title: {
        text: "날짜",
        font: { size: 12, color: "#6b7280" },
      },
      gridcolor: "rgba(0,0,0,0.05)",
      showgrid: true,
      zeroline: false,
      tickfont: { size: 10, color: "#6b7280" },
    },
    yaxis: {
      title: {
        text: "가격 (₩)",
        font: { size: 12, color: "#6b7280" },
      },
      gridcolor: "rgba(0,0,0,0.05)",
      showgrid: true,
      zeroline: false,
      tickfont: { size: 10, color: "#6b7280" },
      tickformat: ",.0f",
    },
    margin: { t: 60, l: 80, r: 40, b: 60 },
    plot_bgcolor: "rgba(0,0,0,0)",
    paper_bgcolor: "rgba(0,0,0,0)",
    font: { family: "Inter, system-ui, sans-serif" },
    hovermode: "x unified",
    hoverlabel: {
      bgcolor: "rgba(0,0,0,0.8)",
      bordercolor: "rgba(0,0,0,0)",
      font: { color: "white", size: 11 },
    },
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chart Container */}
      <div className="flex-1 p-4">
        <div className="h-full bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden">
          <Plot
            data={[
              {
                x: date,
                open: open,
                high: high,
                low: low,
                close: close,
                type: "candlestick",
                name: "캔들스틱",
                increasing: {
                  line: { color: "#ef4444", width: 1 },
                },
                decreasing: {
                  line: { color: "#3b82f6", width: 1 },
                },
                hovertemplate:
                  "<b>%{x}</b><br>" +
                  "시가: %{open:,.0f}<br>" +
                  "고가: %{high:,.0f}<br>" +
                  "저가: %{low:,.0f}<br>" +
                  "종가: %{close:,.0f}<br>" +
                  "<extra></extra>",
              },
              {
                x: date,
                y: close,
                type: "scatter",
                mode: "lines",
                name: "종가",
                line: {
                  color: "#6b7280",
                  width: 1.5,
                  dash: "dot",
                },
                hovertemplate: "종가: %{y:,.0f}<extra></extra>",
              },
              {
                x: date,
                y: ma5,
                type: "scatter",
                mode: "lines",
                name: "MA5",
                line: {
                  width: 2,
                  color: "#22d3ee",
                  smoothing: 1.3,
                },
                hovertemplate: "MA5: %{y:,.0f}<extra></extra>",
              },
              {
                x: date,
                y: ma20,
                type: "scatter",
                mode: "lines",
                name: "MA20",
                line: {
                  width: 2,
                  color: "#a3e635",
                  smoothing: 1.3,
                },
                hovertemplate: "MA20: %{y:,.0f}<extra></extra>",
              },
              {
                x: date,
                y: ma60,
                type: "scatter",
                mode: "lines",
                name: "MA60",
                line: {
                  width: 2,
                  color: "#fbbf24",
                  smoothing: 1.3,
                },
                hovertemplate: "MA60: %{y:,.0f}<extra></extra>",
              },
              {
                x: date,
                y: ma120,
                type: "scatter",
                mode: "lines",
                name: "MA120",
                line: {
                  width: 2,
                  color: "#f472b6",
                  smoothing: 1.3,
                },
                hovertemplate: "MA120: %{y:,.0f}<extra></extra>",
              },
            ]}
            layout={layout}
            useResizeHandler
            style={{
              width: "100%",
              height: "100%",
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              modeBarButtonsToRemove: [
                "pan2d",
                "lasso2d",
                "select2d",
                "autoScale2d",
                "hoverClosestCartesian",
                "hoverCompareCartesian",
                "toggleSpikelines",
              ],
              toImageButtonOptions: {
                format: "png",
                filename: `${companyName}_chart`,
                height: 600,
                width: 1200,
                scale: 2,
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
