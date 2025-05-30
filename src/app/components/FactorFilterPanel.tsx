"use client"

import React from "react"

type Props = {
  selectedFactors: string[]
  setSelectedFactors: (factors: string[]) => void
}

const FACTOR_LIST = [
  "시가총액",
  "PER",
  "PBR",
  "ROE",
  "부채비율",
  "영업이익률",
  "매출성장률",
  "배당수익률",
]

export default function FactorFilterPanel({ selectedFactors, setSelectedFactors }: Props) {
  const toggleFactor = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      setSelectedFactors(selectedFactors.filter((f) => f !== factor))
    } else {
      setSelectedFactors([...selectedFactors, factor])
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">📊 가치 팩터 선택</h2>
      <div className="flex flex-col gap-3">
        {FACTOR_LIST.map((factor) => (
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
  )
}
