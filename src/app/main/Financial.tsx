'use client'

import { useEffect, useState } from 'react'

type MarketItem = {
  name: string
  value: string
  change: string
}

export default function MarketSummary() {
  const [market, setMarket] = useState<MarketItem[]>([])

  useEffect(() => {
    const fetchMarket = async () => {
      const res = await fetch('/api/financials')
      const json = await res.json()
      setMarket(json)
    }

    fetchMarket()
    const interval = setInterval(fetchMarket, 15000) // 15초마다 갱신
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">시장 지수 요약</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {market.map((item, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 shadow-sm bg-white hover:bg-gray-50 transition"
          >
            <p className="text-sm text-gray-500">{item.name}</p>
            <p className="text-xl font-bold text-gray-900">{item.value}</p>
            <p
              className={`text-sm font-medium ${
                item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {item.change}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
