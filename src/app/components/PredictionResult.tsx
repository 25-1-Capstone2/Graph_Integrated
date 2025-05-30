"use client"

import React from "react"

type Props = {
  selectedFactors: string[]
  stock: {
    code: string
    name: string
  }
}

export default function PredictionResult({ selectedFactors, stock }: Props) {
  if (!stock.code) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        종목을 선택해주세요.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">🔮 예측 결과</h2>

      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">종목: {stock.name} ({stock.code})</h3>
        <p className="text-sm text-gray-600 mb-4">
          선택한 가치 팩터: {selectedFactors.length > 0 ? selectedFactors.join(", ") : "없음"}
        </p>

        {/* 목업 예측 결과 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="text-gray-500">예상 수익률</div>
            <div className="text-lg font-bold text-green-600">+12.7%</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="text-gray-500">리스크 지수</div>
            <div className="text-lg font-bold text-red-500">낮음</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="text-gray-500">추천 여부</div>
            <div className="text-lg font-bold text-blue-500">매수 추천</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="text-gray-500">모델 신뢰도</div>
            <div className="text-lg font-bold">87%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
