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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('삼성전자') // ✅ 기본값
  const [code, setCode] = useState<string | null>(null)
  const [days, setDays] = useState<number>(3)

  // ✅ 회사명 → 종목코드 변환
  const fetchCode = async (name: string) => {
    try {
      const res = await fetch(`http://localhost:8000/code?name=${encodeURIComponent(name)}`)
      const data = await res.json()
      if (data.code && data.code !== 'NOT_FOUND') {
        setCode(data.code)
        return data.code
      } else {
        throw new Error('종목코드를 찾을 수 없습니다.')
      }
    } catch (err) {
      setError((err as Error).message)
      return null
    }
  }

  const fetchSummary = async (stockCode: string) => {
    try {
      setLoading(true)
      const res = await fetch(`http://localhost:8000/summary?code=${stockCode}&days=${days}`)
      if (!res.ok) throw new Error('시세 요약 요청 실패')
      const data = await res.json()
      setSummary(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setError(null)
    const foundCode = await fetchCode(companyName)
    if (foundCode) {
      await fetchSummary(foundCode)
    }
  }

  // 기본 실행
  useEffect(() => {
    handleSearch()
  }, [days])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="회사명을 입력하세요"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              조회
            </button>
          </div>

          {/* ✅ 추가된 부분: 현재 입력된 회사명 표시 */}
          <span className="text-sm text-gray-600">
            🔍 조회 대상: <strong>{companyName}</strong>
          </span>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value={1}>1일</option>
          <option value={3}>3일</option>
          <option value={5}>5일</option>
          <option value={10}>10일</option>
        </select>
      </div>

      {loading ? (
        <p>⏳ 로딩 중...</p>
      ) : error ? (
        <p className="text-red-500">❌ 오류: {error}</p>
      ) : summary.length === 0 ? (
        <p>📭 데이터를 불러올 수 없습니다.</p>
      ) : (
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
                  <td className="border p-2">{item.거래대금.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
