// 리디자인된 PredictModelPage.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import supabase from "../../lib/supabase"
import { useRouter } from "next/navigation"
import Watchlist from "@/app/components/Watchlist"
import FactorFilterPanel from "@/app/components/predict/FactorFilterPanel"
import PredictionResult from "@/app/components/predict/PredictionResult"
import { LogOut, User, TrendingUp, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import {
  BrainCircuit,
  BarChart3,
} from "lucide-react"

const HEADER_HEIGHT = "h-20" // 80px

const PredictModelPage = () => {
  const [user, setUser] = useState<any>(null)
  const [selectedStock, setSelectedStock] = useState({
    code: "005930",
    name: "삼성전자",
  })
  const [selectedFactors, setSelectedFactors] = useState<string[]>([])
  const [priceMap, setPriceMap] = useState<Record<string, any>>({})
  const [query, setQuery] = useState<string>("")
  const [companies, setCompanies] = useState<{ code: string; name: string }[]>([])
  const [filtered, setFiltered] = useState<{ code: string; name: string }[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchWrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!user) return null

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white text-slate-900">
      {/* 왼쪽 사이드바 - Watchlist */}
      <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
        {/* 사이드바 로고 헤더 */}
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
        <div className="flex-1 overflow-hidden">
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
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col bg-white">
        {/* 메인 헤더 */}
        <div className={`border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-8 z-10 ${HEADER_HEIGHT}`}>
          {/* 중앙 검색 */}
          <div className="flex-1 flex items-center" ref={searchWrapperRef} style={{ marginLeft: "350px" }}>
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
            <div className="flex items-center gap-3 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-emerald-400 rounded-none"
                onClick={() => router.push("/")}
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-emerald-400 rounded-none"
                onClick={() => router.push("/predict")}
              >
                <BrainCircuit className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* 왼쪽: 팩터 필터 */}
          <div className="w-full lg:w-[380px] xl:w-[420px] min-w-[280px] border-b lg:border-b-0 lg:border-r border-slate-200 p-4 bg-white flex flex-col">
            <FactorFilterPanel
              selectedFactors={selectedFactors}
              setSelectedFactors={setSelectedFactors}
            />
            <div className="mt-4">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-none py-2">
                예측 시작
              </Button>
            </div>
          </div>

          {/* 중앙: 예측 결과 */}
          <div className="flex-1 p-4 bg-white overflow-y-auto">
            <PredictionResult
              selectedFactors={selectedFactors}
              stock={selectedStock}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default PredictModelPage
