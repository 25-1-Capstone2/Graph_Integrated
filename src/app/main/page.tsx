'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import FinancialTable from './Financial' // ⬅️ 실제는 MarketSummary 역할
import Company from './Company'

type CompanyType = {
  code: string
  name: string
  sector: string
}

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<CompanyType[]>([])
  const [selectedMenu, setSelectedMenu] = useState('dashboard')
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
                <FinancialTable /> {/* MarketSummary 역할 */}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Home
