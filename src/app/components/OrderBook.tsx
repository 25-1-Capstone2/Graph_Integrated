"use client"

import React, { useEffect, useState, useRef } from "react"
import { Activity } from "lucide-react"

type HogaItem = {
  price: string
  qty: string
}

type OrderbookData = {
  stock_code: string
  sell: HogaItem[]
  buy: HogaItem[]
  sell_total: string
  buy_total: string
  acc_vol: string
}

type Props = {
  code: string
  companyName: string
}

export default function OrderBook({ code, companyName }: Props) {
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    setError(null)
    setOrderbook(null)
    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL
        ? `${process.env.NEXT_PUBLIC_WS_URL}/ws/orderbook?code=${code}`
        : `ws://localhost:8000/ws/orderbook?code=${code}`
    )
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === "orderbook") {
          setOrderbook(msg.data)
          setError(null)
        } else if (msg.type === "error") {
          setError("실시간 호가 데이터는 장중(09:00~15:30)에만 제공됩니다.")
        }
      } catch {
        setError("WS 데이터 파싱 에러")
      }
    }

    ws.onerror = () => {
      setError("WS 오류 (장 마감/비영업시간이거나 서버 연결 문제)")
    }

    ws.onclose = () => {
      setError("WS 연결이 종료되었습니다. (장마감/비영업시간)")
    }

    return () => {
      ws.close()
    }
  }, [code])

  // 매도/매수 10단계 → 상위 5개만 출력
  const sellList = orderbook?.sell?.slice(0, 5) ?? []
  const buyList = orderbook?.buy?.slice(0, 5) ?? []

  return (
    <div className="h-full w-full overflow-hidden border-0 bg-white p-0 m-0">
      {/* 헤더: 여백만 줄임 */}
      <div className="pt-0 pb-1 px-0 border-b border-slate-200 bg-white flex flex-col items-center">
        <h3 className="text-2xl font-bold text-black mb-0 flex items-center gap-2 justify-center text-center">
          <Activity className="w-6 h-6 text-emerald-500" />
          실시간 호가
        </h3>
        <div className="text-lg text-gray-800 font-semibold text-center mt-0">{companyName}</div>
      </div>
      {/* Content */}
      <div className="p-0">
        {error ? (
          <div>
            <hr className="border-t border-slate-200 w-full" />
            <div className="p-4 text-center text-amber-600 bg-white font-medium border border-amber-100 my-2">
              {error}
            </div>
          </div>
        ) : !orderbook ? (
          <div className="flex items-center justify-center h-36 animate-pulse text-gray-500 bg-white">
            <div className="text-center">
              <Activity className="w-5 h-5 animate-pulse mx-auto mb-2 text-blue-500" />
              호가 데이터 수신 대기중...
            </div>
          </div>
        ) : (
          <div>
            {/* 종목/누적거래량/총매수총매도 */}
            <div className="flex justify-between items-center px-0 py-2 bg-white border-b text-xs font-medium">
              <span className="text-slate-700">코드: {orderbook.stock_code}</span>
              <span className="text-slate-700">누적거래량: {Number(orderbook.acc_vol).toLocaleString()}</span>
            </div>
            <div className="flex justify-between px-0 py-1.5 text-xs font-medium border-b bg-white">
              <span className="text-red-500">총매도호가: {Number(orderbook.sell_total).toLocaleString()}</span>
              <span className="text-blue-500">총매수호가: {Number(orderbook.buy_total).toLocaleString()}</span>
            </div>

            {/* 호가 테이블 헤더 */}
            <div className="grid grid-cols-3 gap-1 p-0 bg-white text-gray-600 font-medium text-xs border-b border-slate-100">
              <div className="text-right">매도잔량</div>
              <div className="text-center">호가</div>
              <div className="text-left">매수잔량</div>
            </div>

            {/* 매도 (위) */}
            {sellList.map((v, idx) => (
              <div
                key={`sell-${idx}`}
                className="grid grid-cols-3 gap-1 p-0 border-b border-gray-100 hover:bg-red-50/50 transition-colors"
              >
                <div className="text-right text-red-600 font-medium">{Number(v.qty).toLocaleString()}</div>
                <div className="text-center font-semibold text-slate-700">{Number(v.price).toLocaleString()}</div>
                <div></div>
              </div>
            ))}

            {/* 구분선 */}
            <div className="h-2 bg-gradient-to-r from-blue-100 via-purple-100 to-red-100 shadow-inner" />

            {/* 매수 (아래) */}
            {buyList.map((v, idx) => (
              <div
                key={`buy-${idx}`}
                className="grid grid-cols-3 gap-1 p-0 border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
              >
                <div></div>
                <div className="text-center font-semibold text-slate-700">{Number(v.price).toLocaleString()}</div>
                <div className="text-left text-blue-600 font-medium">{Number(v.qty).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
