'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Layout } from 'plotly.js'


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <p>💹 실시간 시세 불러오는 중...</p>
})

type Props = {
  code: string
  companyName: string
}

type PricePoint = {
  time: string
  price: number
}

export default function RealtimePriceChart({ code, companyName }: Props) {
  const [data, setData] = useState<PricePoint[]>([])
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [prevPrice, setPrevPrice] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

   const fetchPrice = async () => {
  try {
    const res = await fetch(`${BASE_URL}/price?code=${code}`)
    if (!res.ok) throw new Error('시세 조회 실패')
    const json = await res.json()
    if (!json.price || !json.time) throw new Error('시세 데이터 없음')

    const point: PricePoint = {
      time: json.time,
      price: json.price
    }

    setPrevPrice((prev) => currentPrice ?? prev)
    setCurrentPrice(point.price)
    setData((prev) => [...prev.slice(-60), point])
  } catch (err) {
    setError((err as Error).message)
  }
}

    fetchPrice()
    interval = setInterval(fetchPrice, 5000)

    return () => clearInterval(interval)
  }, [code, currentPrice])

  if (error) return <p className="text-red-500">❌ {error}</p>
  if (data.length === 0) return <p>📭 실시간 시세 없음</p>

  const times = data.map((d) => d.time)
  const prices = data.map((d) => d.price)

  const layout: Partial<Layout> = {
    title: { text: `${companyName} 실시간 시세 (5초 간격)` },
    xaxis: { title: { text: '시간' } },
    yaxis: { title: { text: '가격 (₩)' } },
    margin: { t: 40, l: 50, r: 30, b: 50 },
    template: 'plotly_white' as any
  }

  const priceChangeColor =
    prevPrice !== null && currentPrice !== null
      ? currentPrice > prevPrice
        ? 'red'
        : currentPrice < prevPrice
        ? 'blue'
        : 'black'
      : 'black'

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">💹 실시간 시세</h2>
      {currentPrice !== null && (
        <p className="text-xl font-bold mb-4" style={{ color: priceChangeColor }}>
          현재가: ₩{currentPrice.toLocaleString()}
        </p>
      )}
      <Plot
        data={[
          {
            x: times,
            y: prices,
            type: 'scatter',
            mode: 'lines+markers',
            name: '현재가',
            line: { color: 'green', width: 2 },
            marker: { color: 'green', size: 6 }
          }
        ]}
        layout={layout}
        useResizeHandler
        style={{ width: '100%', height: '400px' }}
        config={{ responsive: true }}
      />
    </div>
  )
}
