'use client'

import { useEffect, useState } from "react"
import { Search, Star, Plus, X, Minus, ChevronUp, ChevronDown } from "lucide-react"
import supabase from '../../lib/supabase'


type Stock = {
  code: string
  name: string
}

type WatchlistStock = Stock & {
  id?: number
}

type Props = {
  selectedStock: Stock
  onStockSelect: (stock: Stock) => void
  userId: string // ★ 유저ID 전달받음
}

export default function Watchlist({ selectedStock, onStockSelect, userId }: Props) {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [marketSummaryOpen, setMarketSummaryOpen] = useState(true)

  // 전체 종목 데이터 (실제론 fetch로 대체)
  const allStocks: Stock[] = [
    { code: "000660", name: "SK하이닉스" },
    { code: "035720", name: "카카오" },
    { code: "068270", name: "셀트리온" },
    { code: "207940", name: "삼성바이오로직스" },
    { code: "373220", name: "LG에너지솔루션" },
    { code: "006400", name: "삼성SDI" },
    { code: "000270", name: "기아" },
    { code: "105560", name: "KB금융" },
    { code: "005930", name: "삼성전자" },
    // ...기타 종목 추가
  ]

  // 1) 관심종목 불러오기 (유저별)
  useEffect(() => {
    if (!userId) return
    const fetchWatchlist = async () => {
      const { data, error } = await supabase
        .from('watchlist')
        .select('id, stock_code, stock_name')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (!error && data) {
        setWatchlist(data.map(item => ({
          id: item.id,
          code: item.stock_code,
          name: item.stock_name
        })))
      }
    }
    fetchWatchlist()
  }, [userId])

  // 2) 검색 기능 (관심종목에 없는 것만 필터)
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    const results = allStocks.filter(
      (stock) =>
        (stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || stock.code.includes(searchQuery))
        && !watchlist.some(item => item.code === stock.code)
    )
    setSearchResults(results)
    setIsSearching(true)
  }, [searchQuery, watchlist])

  // 3) 관심종목 추가
  const addFavorite = async (stock: Stock) => {
    if (watchlist.some(item => item.code === stock.code)) return
    const { data, error } = await supabase
      .from('watchlist')
      .insert([
        {
          user_id: userId,
          stock_code: stock.code,
          stock_name: stock.name,
        }
      ])
      .select()
    if (!error && data && data[0]) {
      setWatchlist(prev => [...prev, { ...stock, id: data[0].id }])
    }
    setSearchQuery("") // 추가 후 검색창 비우기
    setIsSearching(false)
  }

  // 4) 관심종목 제거
  const removeFavorite = async (stock: Stock) => {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('stock_code', stock.code)
    if (!error) {
      setWatchlist(prev => prev.filter(item => item.code !== stock.code))
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* 사이드바 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">관심종목</h2>
        {/* 검색창 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="종목명 또는 코드 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("")
                setIsSearching(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {/* 검색 결과: 관심종목에 없는 것만 표시, + 버튼으로 추가 */}
      {isSearching && searchResults.length > 0 && (
        <div className="border-b border-gray-200">
          {searchResults.map((stock) => (
            <div
              key={stock.code}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div>
                <span className="font-medium text-gray-900">{stock.name}</span>
                <span className="ml-2 text-xs text-gray-500">{stock.code}</span>
              </div>
              <button
                onClick={() => addFavorite(stock)}
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> 추가
              </button>
            </div>
          ))}
        </div>
      )}
      {isSearching && searchResults.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
        </div>
      )}

      {/* 관심종목 리스트: - 버튼으로 삭제 */}
      <div className="flex-1 overflow-y-auto">
        {watchlist.length === 0 && (
          <div className="p-8 text-center text-gray-400">관심종목을 추가해보세요.</div>
        )}
        {watchlist.map((stock) => (
          <div
            key={stock.code}
            onClick={() => onStockSelect(stock)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${selectedStock.code === stock.code ? "bg-blue-50" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium text-gray-900">{stock.name}</span>
                <span className="text-xs text-gray-500">{stock.code}</span>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation()
                  removeFavorite(stock)
                }}
                className="text-gray-400 hover:text-red-500 flex items-center"
              >
                <Minus className="w-4 h-4 mr-1" /> 삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}