'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Watchlist from '@/app/components/Watchlist'
import FinancialTable from './Financial'
import ProfitCalculator from '@/app/components/ProfitCalculator'
import MaChart from '@/app/components/MaChart'
import CandleChart from '@/app/components/CandleChart'
import RSIChart from '@/app/components/RSIChart'
import Financial from './Financials'
import CombinedChart from '@/app/components/Company_Chart'

type Stock = {
  code: string    // ★ null 허용하지 않음!
  name: string
}

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [selectedStock, setSelectedStock] = useState<Stock>({
    code: "005930",
    name: "삼성전자",
  })
  const [selectedMenu, setSelectedMenu] = useState('dashboard')
  const [days, setDays] = useState<number>(3)
  const router = useRouter()

  // 로그인 세션 체크
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    }
    fetchSession()
  }, [router])

  if (!user) return null

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f9fafb' }}>
      {/* 왼쪽: 관심종목(Watchlist) */}
      <div style={{ width: 320, minWidth: 260, maxWidth: 400, borderRight: "1px solid #eee", background: "white" }}>
        <Watchlist
          selectedStock={selectedStock}
          onStockSelect={stock => setSelectedStock(stock)}
          userId={user.id}  // ★★ supabase user.id
        />
      </div>
      {/* 중앙: 본문 */}
      <div style={{ flex: 1 }}>
        <Header
          userEmail={user.email}
          onSelect={(code: string, name: string) => {
            // code가 null일 경우 ''로 변환 (에러 방지)
            setSelectedStock({ code: code ?? '', name })
          }}
        />
        <div style={{ padding: '24px' }}>
          {/* 대시보드: 중앙엔 차트만! */}
          {selectedMenu === 'dashboard' && (
            <div style={{ width: '100%', minHeight: 420 }}>
              {selectedStock.code
                ? <CombinedChart code={selectedStock.code} companyName={selectedStock.name} />
                : <div style={{
                  height: 420,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fafbfc",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  color: "#999"
                }}>
                  종목을 선택해주세요.
                </div>
              }
            </div>
          )}

          {/* 주식차트 메뉴 (필요에 따라 유지) */}
          {selectedMenu === 'stockchart' && (
            <div>
              <Financial
                companyName={selectedStock.name}
                setCompanyName={name => setSelectedStock(prev => ({ ...prev, name }))}
                code={selectedStock.code}
                setCode={code => setSelectedStock(prev => ({ ...prev, code: code ?? '' }))}
                days={days}
                setDays={setDays}
              />
              {selectedStock.code && (
                <div style={{ marginTop: '32px' }}>
                  <MaChart code={selectedStock.code} companyName={selectedStock.name} />
                  <CandleChart code={selectedStock.code} companyName={selectedStock.name} />
                  <RSIChart code={selectedStock.code} companyName={selectedStock.name} />
                  <ProfitCalculator code={selectedStock.code} companyName={selectedStock.name} />
                  <FinancialTable />
                </div>
              )}
              {!selectedStock.code && <p>종목을 먼저 검색해주세요.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
