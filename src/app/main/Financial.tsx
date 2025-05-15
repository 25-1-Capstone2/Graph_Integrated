'use client'

import { useEffect, useState } from 'react'
import MarketChart from '@/app/components/Chart/FinancialChart'

type MarketItem = {
  name: string
  value: string
  change: string
}

type DataPoint = {
  time: string
  value: number
}

export default function FinancialTable() {
  const [market, setMarket] = useState<MarketItem[]>([])
  const [chartData, setChartData] = useState<DataPoint[]>([])

  // ✅ 네이버에서 실시간 지수 불러오기
  useEffect(() => {
    const fetchMarket = async () => {
      const res = await fetch('/api/financials')
      const json = await res.json()
      setMarket(json)
    }

    fetchMarket()
    const interval = setInterval(fetchMarket, 10000)
    return () => clearInterval(interval)
  }, [])

  // ✅ Yahoo에서 시계열 데이터 한번에 받아오기
  useEffect(() => {
    const fetchChartData = async () => {
      const res = await fetch('/api/financials_Chart')
      const json = await res.json()
      setChartData(json)
    }
    fetchChartData()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">시장 지수 요약</h2>

      {/* 실시간 지수 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {market
          .filter((item) => item.name === '코스피')
          .map((item, i) => (
            <div
              key={i}
              className="border rounded-lg p-4 shadow-sm bg-white hover:bg-gray-50 transition"
            >
              <p className="text-sm text-gray-500">{item.name}</p>
              <p className="text-xl font-bold text-gray-900">{item.value}</p>
              {/* 변동 퍼센트만 표시 (예: +0.12%) */}
              <p
                className={`text-sm font-medium ${
                  item.change.includes('+') ? 'text-red-500' : 'text-blue-500'
                }`}
              >
                {
                  // 정규식으로 마지막 퍼센트 값만 추출
                  item.change.match(/[-+]\d+(\.\d+)?%/)?.[0] || ''
                }
              </p>
            </div>
        ))}


      </div>

      {/* 시계열 차트 */}
      <MarketChart data={chartData} title="코스피 추이" />
    </div>
  )
}
