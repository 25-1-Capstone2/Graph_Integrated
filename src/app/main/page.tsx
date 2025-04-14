'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import FinancialTable from './Financial'
import Company from './Company'
import StockComp from '@/app/components/StockComp' // 해당 컴포넌트 없으면 임시 컴포넌트 만들어도 OK

type Statement = {
  year: number
  item: string
  amount: number
}

type CompanyType = {
  code: string
  name: string
  sector: string
}

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<Statement[]>([])
  const [company, setCompany] = useState<CompanyType[]>([])
  const [selectedMenu, setSelectedMenu] = useState('dashboard') // 👈 선택 메뉴 상태
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

    const fetchFinancials = async () => {
      const res = await fetch('/api/financials')
      const json = await res.json()
      setData(json.data || [])
    }

    const fetchCompany = async () => {
      const res = await fetch('/api/company')
      const json = await res.json()
      setCompany(json.data || [])
    }

    fetchFinancials()
    fetchCompany()
  }, [user, selectedMenu])

  if (!user) return null

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar onSelect={setSelectedMenu} /> {/* 메뉴 선택 시 setSelectedMenu 호출 */}
      <div style={{ flex: 1 }}>
        <Header userEmail={user.email} />

        <div style={{ padding: '24px' }}>
          {selectedMenu === 'dashboard' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <Company data={company} />
              </div>
              <div style={{ flex: 2 }}>
                <FinancialTable data={data} />
              </div>
            </div>
          )}

          {selectedMenu === 'watchlist' && <StockComp />}
        </div>
      </div>
    </div>
  )
}

export default Home
