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
import CompanySummary from "@/app/components/CompanySummary"   // ⬅️ 추가

import { BarChart3, Activity, Calculator, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/Badge"

type Stock = { code: string; name: string }
type PriceTick = { price: number, diff: number, diff_rate: number } | null

const chartTabs = [
  { key: "combined", label: "차트", icon: BarChart3, desc: "캔들스틱 + 이동평균선" },
  { key: "rsi", label: "RSI", icon: Activity, desc: "상대강도지수" },
  { key: "profit", label: "수익률", icon: Calculator, desc: "수익률 계산기" },
]

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [selectedStock, setSelectedStock] = useState<Stock>({
    code: "005930",
    name: "삼성전자",
  })
  const [selectedTab, setSelectedTab] = useState<string>("combined")
  // 🟦 실시간 가격 map (중앙/왼쪽 모두에서 공유)
  const [priceMap, setPriceMap] = useState<Record<string, PriceTick>>({})

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

  // 실시간 가격 정보 (관심종목과 즉시 동기화!)
  const priceInfo = priceMap[selectedStock.code]
  const isPositive = priceInfo && priceInfo.diff > 0
  const isZero = priceInfo && priceInfo.diff === 0

  // 차트 카드 안에 렌더링될 실제 내용
  const renderTabContent = () => {
    if (!selectedStock.code) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200 animate-in fade-in">
          <BarChart3 className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">종목을 선택해주세요</h3>
          <p className="text-sm text-gray-500 text-center">
            왼쪽 관심종목에서 종목을 선택하면<br />차트와 분석 정보를 확인할 수 있습니다.
          </p>
        </div>
      )
    }
    if (selectedTab === "combined") {
      return <CombinedChart code={selectedStock.code} companyName={selectedStock.name} />
    }
    if (selectedTab === "rsi") {
      return <RSIChart code={selectedStock.code} companyName={selectedStock.name} />
    }
    if (selectedTab === "profit") {
      return <ProfitCalculator code={selectedStock.code} companyName={selectedStock.name} />
    }
    return null
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f9fafb" }}>
      {/* 왼쪽: 관심종목(Watchlist) */}
      <div style={{ width: 320, minWidth: 260, maxWidth: 400, borderRight: "1px solid #eee", background: "white" }}>
        <Watchlist
          selectedStock={selectedStock}
          onStockSelect={setSelectedStock}
          userId={user.id}
          priceMap={priceMap}
          setPriceMap={setPriceMap}
        />
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
          <div className="flex-1 flex flex-col p-6" style={{ minWidth: 0 }}>
            {/* 상단 종목 정보 카드 */}
            {selectedStock.code && (
              <Card className="mb-4 bg-gradient-to-br from-white to-blue-50/40 rounded-2xl border border-gray-200 shadow-md px-0 py-0">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">{selectedStock.name}</h2>
                      <p className="text-xs text-gray-500">{selectedStock.code}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">실시간</Badge>
                  </div>
                  {/* 실시간 가격 정보 */}
                  <div className="text-right min-w-[130px]">
                    {priceInfo ? (
                      <>
                        <div className={`text-2xl font-bold leading-tight ${isZero ? "text-gray-500" : isPositive ? "text-red-600" : "text-blue-600"}`}>
                          {priceInfo.price.toLocaleString()}원
                        </div>
                        <div className={`text-xs flex items-center justify-end gap-1 ${isZero ? "text-gray-400" : isPositive ? "text-red-600" : "text-blue-600"}`}>
                          {isPositive ? <TrendingUp className="w-4 h-4" /> : isZero ? null : <TrendingDown className="w-4 h-4" />}
                          {isPositive ? "+" : isZero ? "" : ""}
                          {priceInfo.diff?.toLocaleString()}원 ({isPositive ? "+" : isZero ? "" : ""}
                          {priceInfo.diff_rate?.toFixed(2)}%)
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" /> 로딩 중
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 탭 네비게이션 */}
            <div className="mb-4">
              <div className="flex gap-2 p-1 bg-gray-100/80 rounded-2xl shadow-inner">
                {chartTabs.map(tab => {
                  const IconComponent = tab.icon
                  const isActive = selectedTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key)}
                      className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                        font-medium text-base transition-all duration-200
                        border ${isActive ? "bg-white text-blue-600 shadow border-blue-200 scale-105" : "text-gray-600 border-transparent hover:text-blue-700 hover:bg-white"}
                      `}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs ml-1">{tab.desc}</Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 차트 콘텐츠 카드 */}
            <Card className="flex-1 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl">
              <CardContent className="p-0 h-full">
                <div className="h-full w-full rounded-2xl overflow-hidden">{renderTabContent()}</div>
              </CardContent>
            </Card>

            {/* ====== 여기에 기업 개요 추가 ====== */}
            {selectedStock.code && (
              <CompanySummary code={selectedStock.code} />
            )}

          </div>

          {/* 오른쪽: 실시간 호가 + 단기 시세 요약 */}
          <div
            style={{
              width: 300,
              minWidth: 300,
              maxWidth: 350,
              display: "flex",
              flexDirection: "column",
              gap: 1,
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
