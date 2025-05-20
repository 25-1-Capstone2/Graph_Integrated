'use client'

import Plot from 'react-plotly.js'
import { useEffect, useState } from 'react'

type ChartProps = {
  code: string
}

const Chart = ({ code }: ChartProps) => {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetchChart = async () => {
      const res = await fetch(`http://localhost:8000/chart?code=${code}`)
      const json = await res.json()
      setData(json)
    }
    fetchChart()
  }, [code])

  if (!data.length) return <div>Loading chart...</div>

  const dates = data.map((d) => d.Date)
  const close = data.map((d) => d.Close)
  const ma5 = data.map((d) => d.MA5)
  const ma20 = data.map((d) => d.MA20)
  const ma60 = data.map((d) => d.MA60)
  const ma120 = data.map((d) => d.MA120)

  return (
    <Plot
      data={[
        { x: dates, y: close, type: 'scatter', mode: 'lines', name: '종가' },
        { x: dates, y: ma5, type: 'scatter', mode: 'lines', name: 'MA5' },
        { x: dates, y: ma20, type: 'scatter', mode: 'lines', name: 'MA20' },
        { x: dates, y: ma60, type: 'scatter', mode: 'lines', name: 'MA60' },
        { x: dates, y: ma120, type: 'scatter', mode: 'lines', name: 'MA120' },
      ]}
      layout={{ title: '📈 이동평균선 + 종가 차트', xaxis: { title: '날짜' }, yaxis: { title: '가격 (₩)' } }}
      useResizeHandler
      style={{ width: '100%', height: '400px' }}
    />
  )
}

export default Chart
