"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ProfitCalculatorProps {
  companyName: string
}

const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ companyName }) => {
  const [buyPrice, setBuyPrice] = useState<number | null>(null)
  const [quantity, setQuantity] = useState<number | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleCalculate = async () => {
    if (!buyPrice || !quantity) {
      setError("매입 단가와 매입 수량을 모두 입력해주세요.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data for demonstration
      const mockCurrentPrice = buyPrice * (1 + (Math.random() - 0.5) * 0.2) // Simulate price fluctuation
      const mockResult = {
        현재가: mockCurrentPrice,
        "총 평가금액": mockCurrentPrice * quantity,
        "총 손익": (mockCurrentPrice - buyPrice) * quantity,
        "수익률(%)": ((mockCurrentPrice - buyPrice) / buyPrice) * 100,
      }

      setResult(mockResult)
    } catch (e: any) {
      setError(e.message || "수익률 계산 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 p-6 rounded-xl shadow-sm bg-gradient-to-br from-white to-blue-50 w-full max-w-xl">
      <h2 className="text-lg font-semibold mb-6 text-slate-700 flex items-center gap-2 border-b pb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-100 text-amber-700 rounded-full">
          💰
        </span>
        투자 수익률 계산기 - {companyName}
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">매입 단가 (₩)</label>
          <Input
            type="number"
            className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={buyPrice === null ? "" : buyPrice}
            onChange={(e) => setBuyPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">매입 수량 (주)</label>
          <Input
            type="number"
            className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={quantity === null ? "" : quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <Button
          onClick={handleCalculate}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow w-full font-medium mt-2"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              계산 중...
            </span>
          ) : (
            "수익률 계산"
          )}
        </Button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-red-600 text-sm flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
              {error}
            </p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-2">
            <h3 className="font-medium text-slate-700 border-b pb-2 mb-3">계산 결과</h3>
            <p className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">현재가:</span>
              <span className="font-semibold text-slate-800">₩{result["현재가"]?.toLocaleString() || "-"}</span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">총 평가금액:</span>
              <span className="font-semibold text-slate-800">₩{result["총 평가금액"]?.toLocaleString() || "-"}</span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">총 손익:</span>
              {typeof result["총 손익"] === "number" ? (
                <span className={`font-semibold ${result["총 손익"] >= 0 ? "text-red-600" : "text-blue-600"}`}>
                  {result["총 손익"] >= 0 ? "🔺" : "🔻"} ₩{Math.abs(result["총 손익"]).toLocaleString()}
                </span>
              ) : (
                "-"
              )}
            </p>
            <p className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">수익률:</span>
              {typeof result["수익률(%)"] === "number" ? (
                <span className={`font-semibold ${result["수익률(%)"] >= 0 ? "text-red-600" : "text-blue-600"}`}>
                  {result["수익률(%)"] >= 0 ? "🔺" : "🔻"} {Math.abs(result["수익률(%)"]).toFixed(2)}%
                </span>
              ) : (
                "-"
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfitCalculator
