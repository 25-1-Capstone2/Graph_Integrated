'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  code: string
  companyName: string
}

export default function ProfitCalculator({ code, companyName }: Props) {
  const [buyPrice, setBuyPrice] = useState(60000)
  const [quantity, setQuantity] = useState(10)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(
        `http://localhost:8000/profit?code=${code}&buy_price=${buyPrice}&quantity=${quantity}`
      )
      if (!res.ok) throw new Error('수익률 계산 실패')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error('수익률 계산 오류:', err)
      setError('❌ 계산 실패: 서버 오류 또는 입력값 오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border p-4 rounded-xl shadow w-full max-w-xl">
      <h2 className="text-lg font-semibold mb-4">💰 투자 수익률 계산기 - {companyName}</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">매입 단가 (₩)</label>
          <Input
            type="number"
            className="border rounded p-2 w-full"
            value={buyPrice}
            onChange={(e) => setBuyPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">매입 수량 (주)</label>
          <Input
            type="number"
            className="border rounded p-2 w-full"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <Button
          onClick={handleCalculate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? '계산 중...' : '수익률 계산'}
        </Button>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {result && (
          <div className="mt-4 text-sm space-y-1">
            <p>📌 <strong>현재가:</strong> ₩{result['현재가']?.toLocaleString() || '-'}</p>
            <p>📌 <strong>총 평가금액:</strong> ₩{result['총 평가금액']?.toLocaleString() || '-'}</p>
            <p>📌 <strong>총 손익:</strong> 
              {typeof result['총 손익'] === 'number'
                ? (result['총 손익'] >= 0 ? '🔺' : '🔻') + ' ₩' + result['총 손익'].toLocaleString()
                : '-'}</p>
            <p>📌 <strong>수익률:</strong> 
              {typeof result['수익률(%)'] === 'number'
                ? (result['수익률(%)'] >= 0 ? '🔺' : '🔻') + ' ' + result['수익률(%)'].toFixed(2) + '%'
                : '-'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
