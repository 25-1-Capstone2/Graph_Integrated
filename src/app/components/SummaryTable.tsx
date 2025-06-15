"use client"

import React, { useEffect, useState } from "react"
import { BarChart3 } from "lucide-react"

type Props = {
  code: string
  days?: number
}

type SummaryRow = {
  날짜: string
  시가: number
  고가: number
  저가: number
  종가: number
  전일대비: number
  "등락률(%)": number
  거래량: number
  거래대금: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const formatNumber = (num: number) => {
  if (num >= 1_0000_0000) return `${(num / 1_0000_0000).toFixed(2)}억`
  if (num >= 1_0000) return `${(num / 1_0000).toFixed(2)}만`
  return num.toLocaleString()
}

export default function SummaryTable({ code, days = 3 }: Props) {
  const [data, setData] = useState<SummaryRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!code) return
    setLoading(true)
    fetch(`${BASE_URL}/summary?code=${code}&days=${days}`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [code, days])

  if (loading) {
    return (
      <div className="h-full w-full">
        <div className="py-1 px-0 border-b bg-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm font-medium">단기 시세 요약</span>
        </div>
        <div className="flex items-center justify-center h-24">
          <div className="animate-pulse text-gray-500">불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="h-full w-full">
        <div className="py-1 px-0 border-b bg-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">단기 시세 요약</span>
        </div>
        <div className="py-8 text-center text-gray-400">시세 요약 데이터 없음</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <div className="py-1 px-0 border-b bg-white flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium">단기 시세 요약 ({days}일)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-100 text-gray-600 font-medium">
              <th className="px-1 py-1 border-b">날짜</th>
              <th className="px-1 py-1 border-b">시가</th>
              <th className="px-1 py-1 border-b">고가</th>
              <th className="px-1 py-1 border-b">저가</th>
              <th className="px-1 py-1 border-b">종가</th>
              <th className="px-1 py-1 border-b">전일대비</th>
              <th className="px-1 py-1 border-b">등락률(%)</th>
              <th className="px-1 py-1 border-b">거래량</th>
              <th className="px-1 py-1 border-b">거래대금</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const isUp = row["등락률(%)"] > 0
              const isDown = row["등락률(%)"] < 0
              return (
                <tr key={row.날짜} className="hover:bg-gray-50">
                  <td className="px-1 py-1 text-center border-b">{row.날짜}</td>
                  <td className="px-1 py-1 text-right border-b">{row.시가.toLocaleString()}</td>
                  <td className="px-1 py-1 text-right border-b text-red-600">{row.고가.toLocaleString()}</td>
                  <td className="px-1 py-1 text-right border-b text-blue-600">{row.저가.toLocaleString()}</td>
                  <td className="px-1 py-1 text-right border-b font-bold">
                    <span className={isUp ? "text-red-600" : isDown ? "text-blue-600" : "text-gray-900"}>
                      {row.종가.toLocaleString()}
                    </span>
                  </td>
                  <td className={`px-1 py-1 text-right border-b ${row.전일대비 > 0 ? "text-red-600" : row.전일대비 < 0 ? "text-blue-600" : "text-gray-700"}`}>
                    {row.전일대비 > 0 ? "+" : ""}
                    {row.전일대비.toLocaleString()}
                  </td>
                  <td className={`px-1 py-1 text-right border-b ${isUp ? "text-red-600" : isDown ? "text-blue-600" : "text-gray-700"}`}>
                    {row["등락률(%)"] > 0 ? "+" : ""}
                    {row["등락률(%)"].toFixed(2)}
                  </td>
                  <td className="px-1 py-1 text-right border-b">{formatNumber(row.거래량)}</td>
                  <td className="px-1 py-1 text-right border-b">{formatNumber(row.거래대금)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="p-1 bg-white border-t text-xs text-gray-400 text-center">
        마지막 업데이트: {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}
