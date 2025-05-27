'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import FinancialTable from './Financial'           // 시세 요약 (주식 개별 종목)
import ProfitCalculator from '@/app/components/ProfitCalculator'
import MaChart from '@/app/components/MaChart'
import CandleChart from '@/app/components/CandleChart'
import RSIChart from '@/app/components/RSIChart'
import Financial from './Financials'
import CombinedChart from '@/app/components/Company_Chart'

type CompanyType = {
  code: string
  name: string
  sector: string
}

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [selectedMenu, setSelectedMenu] = useState('dashboard')

  // 주식 검색 관련 상태 (stockchart 전용)
  const [companyName, setCompanyName] = useState('삼성전자')
  const [code, setCode] = useState<string | null>(null)
  const [days, setDays] = useState<number>(3)

  const router = useRouter()

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
    <div style={{ display: 'flex' }}>
      <Sidebar onSelect={setSelectedMenu} />
      <div style={{ flex: 1 }}>
        {/* 헤더: 종목검색 + 로그아웃 */}
        <Header 
          userEmail={user.email}
          onSelect={(code: string, name: string) => {
            setCode(code)
            setCompanyName(name)
          }}
        />
        <div style={{ padding: '24px' }}>
          {/* 대시보드: 중앙엔 차트만! */}
          {selectedMenu === 'dashboard' && (
            <div style={{ width: '100%', minHeight: 420 }}>
              {code
                ? <CombinedChart code={code} companyName={companyName} />
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

          {/* 주식차트 메뉴 */}
          {selectedMenu === 'stockchart' && (
            <div>
              <Financial
                companyName={companyName}
                setCompanyName={setCompanyName}
                code={code}
                setCode={setCode}
                days={days}
                setDays={setDays}
              />
              {code && (
                <div style={{ marginTop: '32px' }}>
                  <MaChart code={code} companyName={companyName} />
                  <CandleChart code={code} companyName={companyName} />
                  <RSIChart code={code} companyName={companyName} />
                  <ProfitCalculator code={code} companyName={companyName} />
                  <FinancialTable /> {/* MarketSummary 역할 */}
                </div>
              )}
              {!code && <p>종목을 먼저 검색해주세요.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
