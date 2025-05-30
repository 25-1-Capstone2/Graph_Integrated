"use client"

import { useEffect, useState } from "react"
import supabase from "../../lib/supabase"
import { useRouter } from "next/navigation"
import Header from "./Header"
import Watchlist from "@/app/components/Watchlist"
import FinancialTable from "./Financial"
import ProfitCalculator from "@/app/components/ProfitCalculator"
import MaChart from "@/app/components/MaChart"
import CandleChart from "@/app/components/CandleChart"
import RSIChart from "@/app/components/RSIChart"
import Financial from "./Financials"
import CombinedChart from '@/app/components/Company_Chart'
import OrderBook from "@/app/components/OrderBook"

type Stock = {
  code: string
  name: string
}

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [selectedStock, setSelectedStock] = useState<Stock>({
    code: "005930",
    name: "삼성전자",
  })
  const [selectedMenu, setSelectedMenu] = useState("dashboard")
  const [days, setDays] = useState<number>(3)
  const router = useRouter()

  // 로그인 세션 체크
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
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
          <div style={{ flex: 1, padding: "24px" }}>
            {selectedMenu === "dashboard" && (
              <div style={{ width: "100%", height: "100%" }}>
                {selectedStock.code ? (
                  <CombinedChart code={selectedStock.code} companyName={selectedStock.name} />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fafbfc",
                      border: "1px solid #eee",
                      borderRadius: 12,
                      color: "#999",
                    }}
                  >
                    종목을 선택해주세요.
                  </div>
                )}
              </div>
            )}

            {selectedMenu === "stockchart" && (
              <div>
                <Financial
                  companyName={selectedStock.name}
                  setCompanyName={(name) => setSelectedStock((prev) => ({ ...prev, name }))}
                  code={selectedStock.code}
                  setCode={(code) => setSelectedStock((prev) => ({ ...prev, code: code ?? "" }))}
                  days={days}
                  setDays={setDays}
                />
                {selectedStock.code && (
                  <div style={{ marginTop: "32px" }}>
                    <MaChart code={selectedStock.code} companyName={selectedStock.name} />
                    <CandleChart code={selectedStock.code} companyName={selectedStock.name} />
                    <RSIChart code={selectedStock.code} companyName={selectedStock.name} />
                    <ProfitCalculator code={selectedStock.code} companyName={selectedStock.name} />
                    <FinancialTable />
                  </div>
                )}
                {!selectedStock.code && <p>종목을 먼저 검색해주세요.</p>}
              </div>
            )}
          </div>

          {/* 오른쪽: 호가창 */}
          <div style={{ width: 350, minWidth: 300, maxWidth: 400, borderLeft: "1px solid #eee", background: "white" }}>
            {selectedStock.code ? (
              <OrderBook code={selectedStock.code} companyName={selectedStock.name} />
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
                종목을 선택하면
                <br />
                호가 정보를 확인할 수 있습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home