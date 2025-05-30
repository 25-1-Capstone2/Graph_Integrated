"use client"

import { useState } from "react"
import Header from "@/app/main/Header"
import Watchlist from "@/app/components/Watchlist"
import PredictionResult from "@/app/components/PredictionResult"
import FactorFilterPanel from "@/app/components/FactorFilterPanel"

const PredictModelPage = () => {
  const [user, setUser] = useState<any>(null)
  const [selectedStock, setSelectedStock] = useState({
    code: "005930",
    name: "삼성전자",
  })
  const [selectedFactors, setSelectedFactors] = useState<string[]>([])

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f9fafb" }}>
      {/* 왼쪽: 관심종목 */}
      <div style={{ width: 320, minWidth: 260, maxWidth: 400, borderRight: "1px solid #eee", background: "white" }}>
        <Watchlist selectedStock={selectedStock} onStockSelect={(stock) => setSelectedStock(stock)} userId={user?.id} />
      </div>

      {/* 중앙: 필터 + 예측 결과 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header
          userEmail={user?.email ?? "guest@example.com"}
          onSelect={(code: string, name: string) => {
            setSelectedStock({ code: code ?? "", name })
          }}
        />

        <div style={{ flex: 1, display: "flex" }}>
          {/* 왼쪽: 필터 선택 */}
          <div style={{ width: "35%", minWidth: 300, padding: 24, background: "#fff", borderRight: "1px solid #eee" }}>
            <FactorFilterPanel selectedFactors={selectedFactors} setSelectedFactors={setSelectedFactors} />
          </div>

          {/* 오른쪽: 예측 결과 */}
          <div style={{ flex: 1, padding: 24 }}>
            <PredictionResult selectedFactors={selectedFactors} stock={selectedStock} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictModelPage
