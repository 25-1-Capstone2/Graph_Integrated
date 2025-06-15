"use client"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import SummaryTable from "@/app/components/SummaryTable"
import { Loader2, AlertCircle } from "lucide-react"


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Props = { code: string }
type SummaryData = {
  name: string
  marketCap: string
  stocks: string
  foreignRate: string
  highest52: string
  lowest52: string
  recentRevenue: number
  recentOpProfit: number
  recentNetProfit: number
  revenueSeries: { year: string, revenue: number, op: number, net: number }[]
  per?: string
  pbr?: string
  dividendYield?: string
  founded?: string
  fiscal?: string
}

export default function CompanySummary({ code }: Props) {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${BASE_URL}/company-summary?code=${code}`)
      .then(r => r.ok ? r.json() : Promise.reject("불러오기 실패"))
      .then(setData)
      .catch(() => setError("기업 요약 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false))
  }, [code])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 w-full h-full">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8 mb-2" />
        <span className="text-gray-600">기업 요약 불러오는 중...</span>
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 w-full h-full">
        <AlertCircle className="text-red-500 w-8 h-8 mb-2" />
        <span className="text-red-700">{error || "정보 없음"}</span>
      </div>
    )
  }

  return (
    <div className="w-full h-full px-2 py-2">
      <div className="flex flex-row gap-10 items-start">
        {/* --- 왼쪽(정보+SummaryTable) --- */}
        <div className="flex flex-col justify-start" style={{ minWidth: 320, flex: 1 }}>
          <div>
            <h3 className="text-lg font-semibold mb-3">{data.name} <span className="text-xs font-normal text-gray-400">({code})</span></h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <span className="text-gray-500">시가총액</span>
              <span className="font-medium">{data.marketCap}</span>
              <span className="text-gray-500">상장주식수</span>
              <span className="font-medium">{data.stocks}</span>
              <span className="text-gray-500">외국인비율</span>
              <span className="font-medium">{data.foreignRate}</span>
              {data.per && <>
                <span className="text-gray-500">PER</span>
                <span className="font-medium">{data.per}</span>
              </>}
              {data.pbr && <>
                <span className="text-gray-500">PBR</span>
                <span className="font-medium">{data.pbr}</span>
              </>}
              {data.dividendYield && <>
                <span className="text-gray-500">배당수익률</span>
                <span className="font-medium">{data.dividendYield}</span>
              </>}
              {data.founded && <>
                <span className="text-gray-500">설립연도</span>
                <span className="font-medium">{data.founded}</span>
              </>}
              {data.fiscal && <>
                <span className="text-gray-500">결산기준</span>
                <span className="font-medium">{data.fiscal}</span>
              </>}
            </div>
          </div>
          <div className="mt-8">
            <SummaryTable code={code} days={3} />
          </div>
        </div>
        {/* --- 오른쪽(차트 묶음) --- */}
        <div className="flex-1 min-w-[420px] flex flex-col gap-2 mt-1">
          {/* gap-2: 차트 간격 좁게, mt-1: 위에서 약간 내림 */}
          <div>
            <h4 className="text-base font-semibold mb-1" style={{ marginLeft: "2px" }}>매출액</h4>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={data.revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" fontSize={12} tick={{ fontSize: 11 }} />
                <YAxis fontSize={12} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 2.3 }}
                  activeDot={{ r: 4 }}
                  name="매출액"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-1" style={{ marginLeft: "2px" }}>영업이익</h4>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={data.revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" fontSize={12} tick={{ fontSize: 11 }} />
                <YAxis fontSize={12} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="op"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 2.3 }}
                  activeDot={{ r: 4 }}
                  name="영업이익"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-base font-semibold mb-1" style={{ marginLeft: "2px" }}>순이익</h4>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={data.revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" fontSize={12} tick={{ fontSize: 11 }} />
                <YAxis fontSize={12} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={{ r: 2.3 }}
                  activeDot={{ r: 4 }}
                  name="순이익"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
