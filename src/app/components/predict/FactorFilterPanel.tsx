"use client"

import React, { useState } from "react"

type Props = {
  selectedFactors: string[]
  setSelectedFactors: (factors: string[]) => void
}

const FACTOR_GROUPS = [
  {
    category: "가치 팩터",
    factors: ["PBR", "PER", "PSR", "POR", "시가총액", "EV"]
  },
  {
    category: "퀄리티 팩터",
    factors: ["ROE", "ROA", "변동성", "F-Score"]
  },
  {
    category: "가격 팩터",
    factors: ["MA5", "MA20", "RSI(9)", "RSI(15)", "RSI(30)", "1M 모멘텀", "3M 모멘텀", "6M 모멘텀"]
  },
  {
    category: "성장성 팩터",
    factors: ["매출 YoY", "매출 QoQ", "순이익 YoY", "순이익 QoQ", "자산 YoY", "자산 QoQ"]
  },
  {
    category: "기타",
    factors: ["EPS", "BPS"]
  }
]

export default function FactorFilterPanel({ selectedFactors, setSelectedFactors }: Props) {
  const [customInputVisible, setCustomInputVisible] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customDesc, setCustomDesc] = useState("")

  const toggleFactor = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      setSelectedFactors(selectedFactors.filter((f) => f !== factor))
    } else {
      setSelectedFactors([...selectedFactors, factor])
    }
  }

  const addCustomFactor = () => {
    const fullName = customDesc ? `${customName} (${customDesc})` : customName
    if (fullName && !selectedFactors.includes(fullName)) {
      setSelectedFactors([...selectedFactors, fullName])
    }
    setCustomName("")
    setCustomDesc("")
    setCustomInputVisible(false)
  }

  return (
    <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
      <h2 className="text-base sm:text-lg font-semibold mb-4">팩터 설정</h2>
      <div className="flex flex-col gap-6">
        {FACTOR_GROUPS.map((group) => (
          <div key={group.category}>
            <h3 className="text-sm sm:text-base font-bold mb-2">{group.category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.factors.map((factor) => (
                <label key={factor} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFactors.includes(factor)}
                    onChange={() => toggleFactor(factor)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-800">{factor}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* 커스텀 팩터 추가 */}
        <div className="mt-6">
          {!customInputVisible ? (
            <button
              onClick={() => setCustomInputVisible(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              ➕ 커스텀 팩터 추가
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="팩터명"
                className="border rounded px-2 py-1 text-sm w-full"
              />
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="수식 또는 설명 (선택)"
                className="border rounded px-2 py-1 text-sm w-full"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={addCustomFactor}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  등록
                </button>
                <button
                  onClick={() => setCustomInputVisible(false)}
                  className="px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded hover:bg-gray-100"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
