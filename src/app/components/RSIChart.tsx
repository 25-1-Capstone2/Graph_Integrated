'use client'

import Plot from 'react-plotly.js'
import { useEffect, useState } from 'react'

type Props = {
  code: string
}

const RSIChart = ({ code }: Props) => {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:8000/chart?code=${code}`)
      const json = await res.json()
      setData(json)
    }
    fetchData()
  }, [code])

  const rsi = data.filter((d) => d.RSI !== null)

  return (
    <Plot
      data={[
        {
          x: rsi.map((d) => d.Date),
          y: rsi.map((d) => d.RSI),
          type: 'scatter',
          mode: 'lines',
          name: 'RSI',
          line: { color: 'orange' },
        },
      ]}
      layout={{
        title: '📉 RSI 차트',
        xaxis: { title: '날짜' },
        yaxis: { title: 'RSI', range: [0, 100] },
        shapes: [
          { type: 'line', x0: rsi[0]?.Date, x1: rsi[rsi.length - 1]?.Date, y0: 70, y1: 70, line: { color: 'red', dash: 'dot' } },
          { type: 'line', x0: rsi[0]?.Date, x1: rsi[rsi.length - 1]?.Date, y0: 30, y1: 30, line: { color: 'blue', dash: 'dot' } },
        ],
      }}
      useResizeHandler
      style={{ width: '100%', height: '400px' }}
    />
  )
}

export default RSIChart
