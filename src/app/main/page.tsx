'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import Company from './Company'
import FinancialTable from './Financial'
import MaChart from '@/app/components/MaChart'
import Financial from './Financials'
import ProfitCalculator from '@/app/components/ProfitCalculator'
import CandleChart from '@/app/components/CandleChart'
import RSIChart from '@/app/components/RSIChart'

type CompanyType = {
  code: string
  name: string
  sector: string
}

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<CompanyType[]>([])
  const [selectedMenu, setSelectedMenu] = useState('dashboard')

  const [companyName, setCompanyName] = useState('삼성전자') // 🔍
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
          {selectedMenu === 'dashboard' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <Company />
              </div>
              <div style={{ flex: 2 }}>
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
                    <FinancialTable /> {/* MarketSummary 역할 */}
                    <ProfitCalculator code={code} companyName={companyName} />
                    <MaChart code={code} companyName={companyName} />
                    <CandleChart code={code} companyName={companyName} />
                    <RSIChart code={code} companyName={companyName} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>  
      </div>
    </div>
  )
}

export default Home
