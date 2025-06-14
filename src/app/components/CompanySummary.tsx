"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "../components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2, AlertCircle } from "lucide-react"

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
}

export default function CompanySummary({ code }: Props) {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`http://localhost:8000/company-summary?code=${code}`)
      .then(r => r.ok ? r.json() : Promise.reject("불러오기 실패"))
      .then(setData)
      .catch(() => setError("기업 요약 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false))
  }, [code])

  if (loading) {
    return (
      <Card className="my-4 border-0 shadow bg-gradient-to-br from-white to-slate-50 rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-500 w-8 h-8 mb-2" />
          <span className="text-gray-600">기업 요약 불러오는 중...</span>
        </CardContent>
      </Card>
    )
  }
  if (error || !data) {
    return (
      <Card className="my-4 border-0 shadow bg-gradient-to-br from-white to-slate-50 rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="text-red-500 w-8 h-8 mb-2" />
          <span className="text-red-700">{error || "정보 없음"}</span>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="my-4 border-0 shadow bg-gradient-to-br from-white to-slate-50 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 기업 개요 */}
          <div className="flex-1 min-w-[220px]">
            <h3 className="text-lg font-semibold mb-3">{data.name} <span className="text-xs font-normal text-gray-400">({code})</span></h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <span className="text-gray-500">시가총액</span>
              <span className="font-medium">{data.marketCap}</span>
              <span className="text-gray-500">상장주식수</span>
              <span className="font-medium">{data.stocks}</span>
              <span className="text-gray-500">외국인비율</span>
              <span className="font-medium">{data.foreignRate}</span>
            </div>
          </div>
          {/* 연간 실적 차트 */}
          <div className="flex-1 min-w-[250px]">
            <h4 className="font-semibold mb-1">연간 실적 추이</h4>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data.revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="매출액" stroke="#1d4ed8" />
                <Line type="monotone" dataKey="op" name="영업이익" stroke="#22c55e" />
                <Line type="monotone" dataKey="net" name="순이익" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
