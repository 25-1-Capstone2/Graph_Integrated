'use client'

import { useState } from 'react'
import StockSummary from './StockSummary'
import WatchList from './WatchList'
import Chart from './Chart'

export default function WatchlistPage() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <StockSummary />
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <WatchList onSelect={setSelectedStock} />
        </div>
        <div style={{ flex: 2 }}>
          <Chart company={selectedStock} />
        </div>
      </div>
    </div>
  )
}
