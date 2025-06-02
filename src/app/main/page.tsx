"use client"

import { useEffect, useState } from "react"
import supabase from "../../lib/supabase"
import { useRouter } from "next/navigation"
import Header from "./Header"
import Watchlist from "@/app/components/Watchlist"
import ProfitCalculator from "@/app/components/ProfitCalculator"
import RSIChart from "@/app/components/RSIChart"
import CombinedChart from '@/app/components/Company_Chart'
import OrderBook from "@/app/components/OrderBook"
import SummaryTable from "@/app/components/SummaryTable"

type Stock = { code: string; name: string }

const chartTabs = [
  { key: "combined", label: "차트" },
  { key: "rsi", label: "RSI" },
  { key: "profit", label: "수익률" },
  // 필요시 더 추가 가능
]

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [selectedStock, setSelectedStock] = useState<Stock>({
    code: "005930",
    name: "삼성전자",
  })
  const [selectedMenu, setSelectedMenu] = useState("dashboard")
  const [days, setDays] = useState<number>(3)
  const [selectedTab, setSelectedTab] = useState<string>("combined")  // << 탭 관리
  const router = useRouter()

  // 로그인 세션 체크
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
      } else {
        setUser(session.user)
      }
    }
    fetchSession()
  }, [router])

  if (!user) return null

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f9fafb" }}>
      {/* 왼쪽: 관심종목(Watchlist) */}
      <div style={{ width: 320, minWidth: 260, maxWidth: 400, borderRight: "1px solid #eee", background: "white" }}>
        <Watchlist selectedStock={selectedStock} onStockSelect={(stock) => setSelectedStock(stock)} userId={user.id} />
      </div>

      {/* 중앙: 본문 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header
          userEmail={user.email}
          onSelect={(code: string, name: string) => {
            setSelectedStock({ code: code ?? "", name })
          }}
        />

        <div style={{ flex: 1, display: "flex" }}>
          {/* 메인 차트 영역 */}
          <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column" }}>
            {/* === 탭 버튼 영역 === */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {chartTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  style={{
                    padding: "8px 24px",
                    borderRadius: 6,
                    border: "none",
                    fontWeight: "bold",
                    fontSize: 16,
                    background: selectedTab === tab.key ? "#2563eb" : "#f3f4f6",
                    color: selectedTab === tab.key ? "white" : "#374151",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* === 각 탭 내용 === */}
            <div style={{ flex: 1, minHeight: 0 }}>
              {selectedTab === "combined" && (
                selectedStock.code
                  ? <CombinedChart code={selectedStock.code} companyName={selectedStock.name} />
                  : <div style={{
                      height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: "#fafbfc", border: "1px solid #eee", borderRadius: 12, color: "#999",
                    }}>
                      종목을 선택해주세요.
                    </div>
              )}
              {selectedTab === "rsi" && (
                selectedStock.code
                  ? <RSIChart code={selectedStock.code} companyName={selectedStock.name} />
                  : <div style={{
                      height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: "#fafbfc", border: "1px solid #eee", borderRadius: 12, color: "#999",
                    }}>
                      종목을 선택해주세요.
                    </div>
              )}
              {selectedTab === "profit" && (
                selectedStock.code
                  ? <ProfitCalculator code={selectedStock.code} companyName={selectedStock.name} />
                  : <div style={{
                      height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: "#fafbfc", border: "1px solid #eee", borderRadius: 12, color: "#999",
                    }}>
                      종목을 선택해주세요.
                    </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 실시간 호가 + 단기 시세 요약 */}
          <div
            style={{
              width: 300,
              minWidth: 300,
              maxWidth: 350,
              display: "flex",
              flexDirection: "column",
              gap: 1, // 카드 간 여백만!
            }}
          >
            {selectedStock.code ? (
              <>
                <OrderBook code={selectedStock.code} companyName={selectedStock.name} />
                <SummaryTable code={selectedStock.code} days={3} />
              </>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                종목을 선택하면<br />호가 정보를 확인할 수 있습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
