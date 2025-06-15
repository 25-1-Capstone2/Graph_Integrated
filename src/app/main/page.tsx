"use client"

import { useEffect, useState, useRef } from "react"
import supabase from "../../lib/supabase"
import { useRouter } from "next/navigation"
import Watchlist from "@/app/components/Watchlist"
import ProfitCalculator from "@/app/components/ProfitCalculator"
import RSIChart from "@/app/components/RSIChart"
import CombinedChart from "@/app/components/Company_Chart"
import OrderBook from "@/app/components/OrderBook"
import SummaryTable from "@/app/components/SummaryTable"
import CompanySummary from "@/app/components/CompanySummary"
import MarketSummaryWidget from "@/app/components/MarketSummaryWidget"
import InvestExpertChat from "@/app/components/InvestExpertChat" // 상단 import 추가


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

import {
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Loader2,
  LogOut,
  Settings,
  ChevronRight,
  Search,
  Bell,
  User,
} from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"

type Stock = { code: string; name: string }
type PriceTick = { price: number; diff: number; diff_rate: number } | null
type Company = { code: string; name: string }

const chartTabs = [
  { key: "combined", label: "차트", icon: BarChart3, desc: "" },
  { key: "company", label: "기업요약", icon: ChevronRight, desc: "" },
  { key: "market", label: "지수", icon: BarChart3, desc: "" },
  { key: "rsi", label: "RSI", icon: Activity, desc: "" },
  { key: "expert", label: "AI", icon: User, desc: "ChatGpt4.1" }, // <-- 추가!
]

const HEADER_HEIGHT = "h-20" // 80px
const SEARCH_MARGIN_LEFT = 450 // px

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [selectedStock, setSelectedStock] = useState<Stock>({
    code: "005930", name: "삼성전자",
  })
  const [selectedTab, setSelectedTab] = useState<string>("combined")
  const [priceMap, setPriceMap] = useState<Record<string, PriceTick>>({})
  const [selectedPrice, setSelectedPrice] = useState<PriceTick | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [query, setQuery] = useState<string>("")
  const [filtered, setFiltered] = useState<Company[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchWrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch('/api/company')
      const json = await res.json()
      setCompanies(json.data || [])
    }
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (query.trim()) {
      setFiltered(
        companies.filter((c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.code.includes(query)
        ).slice(0, 10)
      )
      setShowDropdown(true)
    } else {
      setFiltered([])
      setShowDropdown(false)
    }
  }, [query, companies])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!selectedStock.code) {
      setSelectedPrice(null)
      return
    }
    let isMounted = true
    async function fetchSelectedPrice() {
      if (priceMap[selectedStock.code]) {
        setSelectedPrice(priceMap[selectedStock.code])
        return
      }
      try {
        const res = await fetch(`${BASE_URL}/price?code=${selectedStock.code}`)
        if (!res.ok) throw new Error("fetch error")
        const data = await res.json()
        if (isMounted) setSelectedPrice(data)
      } catch {
        if (isMounted) setSelectedPrice(null)
      }
    }
    fetchSelectedPrice()
    const interval = setInterval(fetchSelectedPrice, 5000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [selectedStock.code, priceMap])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const priceInfo = selectedPrice
  const isPositive = priceInfo && priceInfo.diff > 0
  const isZero = priceInfo && priceInfo.diff === 0

  const renderTabContent = () => {
    if (!selectedStock.code && selectedTab !== "market") {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 animate-in fade-in rounded-none">
          <BarChart3 className="w-16 h-16 text-emerald-400/40 mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">종목을 선택해주세요</h3>
          <p className="text-sm text-slate-400 text-center">
            왼쪽 관심종목에서 종목을 선택하거나<br />
            상단에서 종목을 검색하세요.
          </p>
        </div>
      )
    }
    if (selectedTab === "combined") {
      return <CombinedChart code={selectedStock.code} companyName={selectedStock.name} />
    }
    if (selectedTab === "company") {
      return <CompanySummary code={selectedStock.code} />
    }
    if (selectedTab === "rsi") {
      return <RSIChart code={selectedStock.code} companyName={selectedStock.name} />
    }
    if (selectedTab === "market") {
      return <MarketSummaryWidget />
    }
    if (selectedTab === "expert") {
    return <InvestExpertChat />
    }
    return null
  }

  if (!user) return null
  return (
    <div className="flex h-screen bg-white text-slate-900 relative overflow-hidden">
      {/* Left sidebar - Watchlist */}
      <div className="w-80 bg-white flex flex-col">
        <div className={`flex items-center gap-3 px-4 border-b border-slate-200 bg-white ${HEADER_HEIGHT}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center border border-emerald-400/20 rounded-none">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-yellow-400 bg-clip-text text-transparent tracking-tight">
              StockPredictor
            </h1>
            <p className="text-xs text-slate-400">스마트한 투자의 시작</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-white">
          <Watchlist
            selectedStock={selectedStock}
            onStockSelect={setSelectedStock}
            userId={user.id}
            priceMap={priceMap}
            setPriceMap={setPriceMap}
          />
        </div>
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 flex items-center justify-center rounded-none">
                <User className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-emerald-400 rounded-none"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>로그아웃</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* 메인 헤더 */}
        <div className={`border-b border-slate-200 bg-white flex items-center justify-between px-8 z-10 ${HEADER_HEIGHT}`}>
          <div
            className="flex-1 flex items-center"
            ref={searchWrapperRef}
            style={{ marginLeft: `${SEARCH_MARGIN_LEFT}px` }}
          >
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="종목명 or 코드 검색..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                ref={searchInputRef}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-[16px] text-slate-900 placeholder:text-slate-400 rounded-none"
                autoComplete="off"
              />
              {showDropdown && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-lg max-h-72 overflow-y-auto z-50 rounded-none">
                  {filtered.map(company => (
                    <div
                      key={company.code}
                      onClick={() => {
                        setSelectedStock({ code: company.code, name: company.name })
                        setQuery("")
                        setShowDropdown(false)
                        searchInputRef.current?.blur()
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 rounded-none"
                    >
                      <div className="font-medium text-slate-900">{company.name}</div>
                      <div className="text-xs text-slate-400">{company.code}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 ml-6">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-400 rounded-none">
              <Bell className="h-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-400 rounded-none">
              <Settings className="h-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main content with charts */}
        <div className="flex-1 flex overflow-hidden">
          {/* 상단 패딩만 줄이고 하단은 유지 */}
          <div className="flex-1 flex flex-col pt-3 pb-11 px-11 overflow-y-auto border-none">
            {selectedStock.code && (
            <><hr className="border-t border-gray-200" /><Card className="mb-4 bg-white border-none rounded-none">
                <CardContent className="p-7 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-100 flex items-center justify-center border border-emerald-200 rounded-none">
                      <TrendingUp className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{selectedStock.name}</h2>
                      <p className="text-md text-slate-400">{selectedStock.code}</p>
                    </div>
                  </div>
                  <div className="text-right min-w-[160px]">
                    {priceInfo ? (
                      <>
                        <div
                          className={`text-3xl font-black leading-tight ${isZero ? "text-slate-400" : isPositive ? "text-red-500" : "text-blue-500"}`}
                        >
                          {priceInfo.price.toLocaleString()}원
                        </div>
                        <div
                          className={`text-lg flex items-center justify-end gap-1 ${isZero ? "text-slate-400" : isPositive ? "text-red-500" : "text-blue-500"}`}
                        >
                          {isPositive ? <TrendingUp className="w-5 h-5" /> : isZero ? null : <TrendingDown className="w-5 h-5" />}
                          {isPositive ? "+" : isZero ? "" : ""}
                          {priceInfo.diff?.toLocaleString()}원 ({isPositive ? "+" : isZero ? "" : ""}
                          {priceInfo.diff_rate?.toFixed(2)}%)
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin" /> 로딩 중
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card></>
            )}

            <div className="mb-6">
              <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-none">
                {chartTabs.map((tab) => {
                  const IconComponent = tab.icon
                  const isActive = selectedTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key)}
                      className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3
                        font-medium text-base transition-all duration-200 rounded-none
                        ${
                          isActive
                            ? "bg-emerald-500 text-white shadow border border-emerald-300"
                            : "text-slate-600 border-transparent hover:bg-emerald-50 hover:text-emerald-600"
                        }
                      `}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {isActive && (
                        <span className="ml-2 text-white text-sm">{tab.desc}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            <Card className="flex-1 bg-white border-none mb-7 rounded-none">
              <CardContent className="p-6 h-full">
                <div className="h-full w-full overflow-hidden bg-white rounded-none">
                  {renderTabContent()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar - Order book & Summary */}
          <div className="w-80 border-l border-slate-200 bg-white py-3 px-2 flex flex-col gap-4 overflow-y-auto">
            {selectedStock.code ? (
              <>
                <OrderBook code={selectedStock.code} companyName={selectedStock.name} />
                <hr className="my-7 border-t border-gray-200" />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                <BarChart3 className="w-12 h-12 text-slate-500/40 mb-4" />
                <p>
                  종목을 선택하면<br />호가 정보를 확인할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
