'use client'

import { useState } from 'react'
import BubbleChart from './Chart/BubbleChart'
import LineChart from './Chart/LineChart'
import BarChart from './Chart/BarChart'

type ChartProps = {
  company: string | null
}

export default function Chart({ company }: ChartProps) {
  const [chartType, setChartType] = useState('bubble')

  if (!company) {
    return (
      <div style={{ padding: '16px' }}>
        <h3>종목을 선택해주세요</h3>
      </div>
    )
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bubble':
        return <BubbleChart company={company} />
      case 'line':
        return <LineChart company={company} />
      case 'bar':
        return <BarChart company={company} />
      default:
        return null
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', background: '#fff', borderRadius: '8px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <h3>{company} - {chartType.toUpperCase()} 차트</h3>
        <select value={chartType} onChange={(e) => setChartType(e.target.value)} style={{ padding: '4px 8px' }}>
          <option value="bubble">Bubble Chart</option>
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
        </select> 
      </div>
      {renderChart()}
    </div>
  )
}
