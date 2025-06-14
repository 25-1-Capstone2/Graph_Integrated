"use client"

import React, { useState } from "react"

type Props = {
  selectedFactors: string[]
  setSelectedFactors: (factors: string[]) => void
}

const FACTOR_GROUPS = [
  {
    category: "가치 팩터",
    factors: [
      "PBR", "PER", "PSR", "POR",
      "시가총액",
      "EV (기업가치 - 시가총액 + 순부채)"
    ]
  },
  {
    category: "퀄리티 팩터",
    factors: ["ROE", "ROA", "변동성", "F-score"]
  },
  {
    category: "가격관련 팩터",
    factors: [
      "1개월 모멘텀",
      "3개월 모멘텀",
      "6개월 모멘텀",
      "RSI(9)",
      "RSI(15)",
      "RSI(30)"
    ]
  }
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
              </div>
            </div>
      )}
