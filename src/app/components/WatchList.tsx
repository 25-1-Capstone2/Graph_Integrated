'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type WatchListProps = {
  onSelect: (name: string) => void
}

export default function WatchList({ onSelect }: WatchListProps) {
  const [stocks, setStocks] = useState<any[]>([])
  const [stockInput, setStockInput] = useState('')

  useEffect(() => {
    const fetchStocks = async () => {
      const { data } = await supabase.from('interests').select('*')
      if (data) setStocks(data)
    }
    fetchStocks()
  }, [])

  const addStock = async () => {
    if (!stockInput.trim()) return

    try {
      const { data, error } = await supabase
        .from('interests')
        .insert({ name: stockInput.trim() })
        .select()

      if (error) throw error

      setStocks(prev => [...prev, ...data])
      setStockInput('')
    } catch (error) {
      console.error('추가 실패:', error)
      alert('종목 추가에 실패했습니다.')
    }
  }

  const deleteStock = async (id: number) => {
    try {
      const { error } = await supabase
        .from('interests')
        .delete()
        .eq('id', id)

      if (error) throw error

      setStocks(prev => prev.filter(stock => stock.id !== id))
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('종목 삭제에 실패했습니다.')
    }
  }

  return (
    <div
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#ccc',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
        height: '700px',
      }}
    >
      <h2 style={{ marginBottom: '16px' }}>관심 주식 목록</h2>

      <div style={{ marginBottom: '16px', display: 'flex' }}>
        <input
          type="text"
          value={stockInput}
          onChange={e => setStockInput(e.target.value)}
          placeholder="예: 삼성전자"
          style={{
            flex: 1,
            padding: '8px',
            marginRight: '8px',
            borderRadius: '4px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#ccc',
          }}
        />
        <button
          onClick={addStock}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#0070f3',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          create
        </button>
      </div>

      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {stocks.map(stock => (
          <li key={stock.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onSelect(stock.name)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: '#ccc',
                  borderRadius: '4px',
                  textAlign: 'left',
                  background: '#f9f9f9',
                  color: '#333',
                  cursor: 'pointer',
                }}
              >
                {stock.name}
              </button>
              <button
                onClick={() => deleteStock(stock.id)}
                style={{
                  width: '40px',
                  height: '48px',
                  backgroundColor: 'lightgray',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

