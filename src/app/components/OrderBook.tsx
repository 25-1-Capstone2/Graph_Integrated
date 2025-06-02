"use client"
import React, { useEffect, useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Activity, TrendingUp, TrendingDown } from "lucide-react"

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
    // eslint-disable-next-line
  }, [code])

  // 매도/매수 10단계 → 상위 5개만 출력 (UI 가독성 위해)
  const sellList = orderbook?.sell?.slice(0, 5) ?? []
  const buyList = orderbook?.buy?.slice(0, 5) ?? []

  return (
    <Card className="h-full border-0 shadow-sm">
      <CardHeader className="pb-1 pt-2 px-4 border-b bg-gray-50/50">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          실시간 호가
        </CardTitle>
        <div className="text-xs text-gray-500">{companyName}</div>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="p-6 text-center text-yellow-600 bg-yellow-50 font-semibold rounded">{error}</div>
        ) : !orderbook ? (
          <div className="flex items-center justify-center h-36 animate-pulse text-gray-500">
            호가 데이터 수신 대기중...
          </div>
        ) : (
          <div>
            {/* 종목/누적거래량/총매수총매도 */}
            <div className="flex justify-between items-center px-4 py-2 bg-blue-50 border-b text-xs text-gray-600">
              <span>코드: {orderbook.stock_code}</span>
              <span>누적거래량: {Number(orderbook.acc_vol).toLocaleString()}</span>
            </div>
            <div className="flex justify-between px-4 py-1 text-xs text-gray-400 border-b">
              <span>총매도호가: {Number(orderbook.sell_total).toLocaleString()}</span>
              <span>총매수호가: {Number(orderbook.buy_total).toLocaleString()}</span>
            </div>

            {/* 호가 테이블 */}
            <div className="text-xs">
              {/* 헤더 */}
              <div className="grid grid-cols-3 gap-1 p-2 bg-gray-100 text-gray-600 font-medium rounded-t">
                <div className="text-right">매도잔량</div>
                <div className="text-center">호가</div>
                <div className="text-left">매수잔량</div>
              </div>

              {/* 매도(위), 매수(아래) */}
              {/* 매도: 잔량/호가/빈칸 */}
              {sellList.map((v, idx) => (
                <div key={`sell-${idx}`} className="grid grid-cols-3 gap-1 p-2 border-b border-gray-100 hover:bg-red-50 transition-colors">
                  <div className="text-right text-red-600 font-medium">{Number(v.qty).toLocaleString()}</div>
                  <div className="text-center font-semibold text-blue-700 bg-blue-100 rounded px-2 py-1">{Number(v.price).toLocaleString()}</div>
                  <div></div>
                </div>
              ))}

              {/* 구분선 */}
              <div className="h-2 bg-gradient-to-r from-blue-100 via-purple-100 to-red-100" />

              {/* 매수: 빈칸/호가/잔량 */}
              {buyList.map((v, idx) => (
                <div key={`buy-${idx}`} className="grid grid-cols-3 gap-1 p-2 border-b border-gray-100 hover:bg-blue-50 transition-colors">
                  <div></div>
                  <div className="text-center font-semibold text-red-700 bg-red-100 rounded px-2 py-1">{Number(v.price).toLocaleString()}</div>
                  <div className="text-left text-blue-600 font-medium">{Number(v.qty).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
