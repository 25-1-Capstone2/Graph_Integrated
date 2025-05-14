'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Stock = {
  id: number
  name: string
}

export default function Company() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchStocks = async () => {
      const { data, error } = await supabase.from('interests').select('*')
      if (error) console.error('Fetch error:', error)
      else setStocks(data)
    }
    fetchStocks()
  }, [])

  const filtered = stocks.filter(stock =>
    stock.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">관심 주식 목록</h2>

      <input
        type="text"
        placeholder="종목 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="space-y-2">
        {filtered.map((stock) => (
          <div
            key={stock.id}
            className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white hover:bg-gray-50 transition"
          >
            <p className="text-base font-medium text-gray-800">{stock.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
