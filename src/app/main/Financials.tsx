'use client'

import { useEffect, useState } from 'react'

type SummaryItem = {
  날짜: string
  시가: number
  고가: number
  저가: number
  종가: number
  전일대비: number
  '등락률(%)': number
  거래량: number
  거래대금: string
}

export default function Financial() {
  const [summary, setSummary] = useState<SummaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stockCode = '005930' // 삼성전자

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:8000/summary?code=${stockCode}&days=3`)
        if (!res.ok) throw new Error('데이터 요청 실패')
        const data = await res.json()
        setSummary(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (loading) return <p>⏳ 로딩 중...</p>
  if (error) return <p>❌ 오류: {error}</p>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📊 3일간 삼성전자 시세 요약</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">날짜</th>
              <th className="border p-2">시가</th>
              <th className="border p-2">고가</th>
              <th className="border p-2">저가</th>
              <th className="border p-2">종가</th>
              <th className="border p-2">전일대비</th>
              <th className="border p-2">등락률(%)</th>
              <th className="border p-2">거래량</th>
              <th className="border p-2">거래대금</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item) => (
              <tr key={item.날짜}>
                <td className="border p-2">{item.날짜}</td>
                <td className="border p-2">{item.시가.toLocaleString()}</td>
                <td className="border p-2">{item.고가.toLocaleString()}</td>
                <td className="border p-2">{item.저가.toLocaleString()}</td>
                <td className="border p-2">{item.종가.toLocaleString()}</td>
                <td className="border p-2">{item.전일대비.toLocaleString()}</td>
                <td className="border p-2">{item['등락률(%)'].toFixed(2)}%</td>
                <td className="border p-2">{item.거래량.toLocaleString()}</td>
                <td className="border p-2">{item.거래대금}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
