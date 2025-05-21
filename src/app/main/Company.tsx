'use client'

import { useEffect, useState } from 'react'

type Company = {
  code: string
  name: string
  sector: string
}

export default function Company() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch('/api/company')
      const json = await res.json()

        if (json.data) {
          const uniqueCompanies = Array.from(
            new Map(json.data.map((c: Company) => [c.code, c])).values()
          ) as Company[] // ✅ 타입 단언 추가
          setCompanies(uniqueCompanies)
        }
    }

    fetchCompanies()
  }, [])

  const filtered = companies.filter(company =>
    company.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">KRX 300 기준 종목 목록</h2>

      <input
        type="text"
        placeholder="종목 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* ✅ 종목 카드 리스트를 스크롤 가능하게 */}
      <div className="h-[calc(100vh-250px)] overflow-y-auto pr-1 space-y-2">
        {filtered.map((company) => (
          <div
            key={company.code}
            className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white hover:bg-gray-50 transition"
          >
            <p className="text-base font-medium text-gray-800">{company.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
