'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import Company from './Company'
import FinancialTable from './Financial'           // 시세 요약 (주식 개별 종목)
import ProfitCalculator from '@/app/components/ProfitCalculator'
import MaChart from '@/app/components/MaChart'
import CandleChart from '@/app/components/CandleChart'
import RSIChart from '@/app/components/RSIChart'
import Financial from './Financials'
import CombinedChart from '@/app/components/Comapny_Chart'

type CompanyType = {
  code: string
  name: string
  sector: string
}

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<CompanyType[]>([])
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

  useEffect(() => {
    if (!user || selectedMenu !== 'dashboard') return
    const fetchCompany = async () => {
      const res = await fetch('/api/company')
      const json = await res.json()
      setCompany(json.data || [])
    }
    fetchCompany()
  }, [user, selectedMenu])

  if (!user) return null

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar onSelect={setSelectedMenu} />
      <div style={{ flex: 1 }}>
        <Header userEmail={user.email} />
        <div style={{ padding: '24px' }}>
          {/* 대시보드 선택 시: 코스피 지수 + 선택된 종목 차트 */}
          {selectedMenu === 'dashboard' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <Company onSelect={(code, name) => {
                    setCode(code)
                    setCompanyName(name)
                  }} />
                </div>
                <div style={{ flex: 2 }}>
                  <FinancialTable
                    code={code}
                    companyName={companyName}
                    setCode={setCode}
                    setCompanyName={setCompanyName}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 주식차트 선택 시: 기존 주식 검색 + 금융 관련 컴포넌트 전부 보여줌 */}
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
