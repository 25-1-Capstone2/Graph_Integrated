'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import Company from './Company'
import FinancialTable from './Financial'
import ProfitCalculator from '@/app/components/ProfitCalculator'
import MaChart from '@/app/components/MaChart'
import CandleChart from '@/app/components/CandleChart'
import RSIChart from '@/app/components/RSIChart'
import Financial from './Financials'

type CompanyType = {
  code: string
  name: string
  sector: string
}

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<CompanyType[]>([])
  const [selectedMenu, setSelectedMenu] = useState('dashboard')
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
    <div className="flex flex-col h-screen">
      <Header userEmail={user.email} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSelect={setSelectedMenu} />
        <main className="flex-1 overflow-auto p-6">
          {selectedMenu === 'dashboard' && (
            <div className="flex flex-col gap-6 h-full">
              <div className="flex gap-6 h-full">
                <div className="w-1/3 overflow-y-auto">
                  <Company onSelect={(code, name) => {
                    setCode(code)
                    setCompanyName(name)
                  }} />
                </div>
                <div className="flex-1 overflow-hidden">
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
                <div className="mt-8">
                  <MaChart code={code} companyName={companyName} />
                  <CandleChart code={code} companyName={companyName} />
                  <RSIChart code={code} companyName={companyName} />
                  <ProfitCalculator code={code} companyName={companyName} />
                </div>
              )}
              {!code && <p>종목을 먼저 검색해주세요.</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Home
