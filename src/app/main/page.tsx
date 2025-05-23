'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

import Header from './Header'
import Company from './Company'
import FinancialTable from './Financial'
import Sidebar from './Sidebar'
import Financial from './Financials'
import MaChart from '@/app/components/MaChart'
import CandleChart from '@/app/components/CandleChart'
import RSIChart from '@/app/components/RSIChart'
import ProfitCalculator from '@/app/components/ProfitCalculator'

type CompanyType = {
  code: string
  name: string
  sector: string
}

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<CompanyType[]>([])
  const [selectedMenu, setSelectedMenu] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
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
    <div className="flex h-screen relative">
      {/* ✅ 토글 버튼: 항상 좌상단 고정 */}
      <Button
        onClick={() => setIsSidebarOpen(prev => !prev)}
        variant="outline"
        size="icon"
        className="absolute top-4 left-4 z-50 bg-white border border-gray-300 shadow"
      >
        {isSidebarOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
      </Button>

      {/* ✅ 사이드바 */}
      <Sidebar
        isOpen={isSidebarOpen}
        selectedMenu={selectedMenu}
        setSelectedMenu={setSelectedMenu}
        toggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* ✅ 본문 */}
      <div className="flex-1 flex flex-col">
        <Header userEmail={user.email} />

        <main className="flex-1 overflow-y-auto p-6">
          {selectedMenu === 'dashboard' && (
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
              {code ? (
                <div className="mt-8">
                  <MaChart code={code} companyName={companyName} />
                  <CandleChart code={code} companyName={companyName} />
                  <RSIChart code={code} companyName={companyName} />
                  <ProfitCalculator code={code} companyName={companyName} />
                </div>
              ) : (
                <p>종목을 먼저 검색해주세요.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Home
