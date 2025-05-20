'use client'

import Plot from 'react-plotly.js'
import { useEffect, useState } from 'react'

type Props = {
  code: string
}

const CandleChart = ({ code }: Props) => {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:8000/candle?code=${code}`)
      const json = await res.json()
      setData(json)
    }
    fetchData()
  }, [code])

  if (!data.length) return <div>Loading candle chart...</div>

  return (
    <Plot
      data={[
        {
          x: data.map((d) => d.Date),
          open: data.map((d) => d.Open),
          high: data.map((d) => d.High),
          low: data.map((d) => d.Low),
          close: data.map((d) => d.Close),
          type: 'candlestick',
          name: '봉차트',
          increasing: { line: { color: 'red' } },
          decreasing: { line: { color: 'blue' } },
        },
      ]}
      layout={{ title: '🕯️ 봉차트', xaxis: { title: '날짜' }, yaxis: { title: '가격' }, xaxis_rangeslider_visible: false }}
      useResizeHandler
      style={{ width: '100%', height: '400px' }}
    />
  )
}

export default CandleChart
