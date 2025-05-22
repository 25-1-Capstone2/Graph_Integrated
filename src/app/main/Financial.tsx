'use client'

import { useEffect, useState } from 'react'
import MarketChart from '@/app/components/FinancialChart'
import CombinedChart from '@/app/components/Comapny_Chart' // ⬅️ 종목 차트 컴포넌트 추가

type MarketItem = {
  name: string
  value: string
  change: string
  code?: string
}

type DataPoint = {
  time: string
  value: number
}

type Props = {
  code: string | null
  companyName: string
  setCode: (code: string | null) => void
  setCompanyName: (name: string) => void
}

export default function FinancialTable({ code, companyName, setCode, setCompanyName }: Props) {
  const [market, setMarket] = useState<MarketItem[]>([])
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const [selectedMarket, setSelectedMarket] = useState<string>('코스피')

  const displayNameToQueryKey: Record<string, string> = {
    코스피: 'kospi',
    코스닥: 'kosdaq',
    코스피200: 'kospi200',
  }

  // ✅ 지수 요약 데이터 fetch
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

  // ✅ 지수 or 종목에 따라 차트 데이터 fetch
  useEffect(() => {
    const fetchChartData = async () => {
      if (code) {
        const res = await fetch(`/api/financials_Chart?type=stock&name=${companyName}`)
        const json = await res.json()
        setChartData(json)
      } else {
        const query = displayNameToQueryKey[selectedMarket] || 'kospi'
        const res = await fetch(`/api/financials_Chart?type=${query}`)
        const json = await res.json()
        setChartData(json)
      }
    }

    fetchChartData()
  }, [selectedMarket, code, companyName])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">시장 지수 요약</h2>

      {/* ✅ 지수 요약 카드 UI */}
      <div className="flex gap-4 max-w-3xl w-full mb-6">
        {market.map((item) => {
          const percent = item.change.match(/[-+]\d+(\.\d+)?%/)?.[0] || ''
          const isUp = percent.startsWith('+')
          const isSelected = selectedMarket === item.name

          const colorDot = item.name === '코스피'
            ? 'bg-orange-500'
            : 'bg-teal-500'

          return (
            <button
              key={item.name}
              onClick={() => {
                setSelectedMarket(item.name)
                setCode(null) // 종목 차트 리셋
              }}
              className={`bg-gray-100 rounded-lg p-3 text-left shadow-md hover:shadow-lg transition w-full max-w-[150px]`}
            >
              <div className="flex flex-col items-start text-sm">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span className={`w-2 h-2 rounded-full ${colorDot}`} />
                  {item.name}
                </div>
                <div className={`font-bold ${isUp ? 'text-red-500' : 'text-blue-500'}`}>
                  {item.value}
                </div>
                <div className={`text-xs ${isUp ? 'text-red-500' : 'text-blue-500'}`}>
                  {percent}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* ✅ 선택된 차트 렌더링 */}
      {code ? (
        <CombinedChart code={code} companyName={companyName} />
      ) : (
        chartData.length > 0 && (
          <MarketChart
            data={chartData}
            title={`${selectedMarket} 추이`}
          />
        )
      )}
    </div>
  )
}
