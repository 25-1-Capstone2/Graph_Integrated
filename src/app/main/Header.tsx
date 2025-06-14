'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, User, LogOut, Bell } from 'lucide-react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'

type Company = {
  code: string
  name: string
}

type Props = {
  userEmail: string
  onSelect: (code: string, name: string) => void
}

const Header = ({ userEmail, onSelect }: Props) => {
  const [query, setQuery] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [filtered, setFiltered] = useState<Company[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 실제 API 연동 (한 번만)
  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch('/api/company')
      const json = await res.json()
      setCompanies(json.data || [])
    }
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (query) {
      setFiltered(
        companies.filter((company) =>
          company.name.toLowerCase().includes(query.toLowerCase())
        )
      )
      setShowDropdown(true)
    } else {
      setFiltered([])
      setShowDropdown(false)
    }
  }, [query, companies])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sessionExpirationTime')
    router.push('/login')
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 relative z-50">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <div className="text-xl font-bold text-blue-600 select-none tracking-tight">StockPredictor</div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8" ref={wrapperRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="종목명 검색..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[16px]"
            autoComplete="off"
          />
          {/* 드롭다운 */}
          {showDropdown && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
              {filtered.map((company) => (
                <div
                  key={company.code}
                  onClick={() => {
                    onSelect(company.code, company.name)
                    setQuery('')
                    setShowDropdown(false)
                  }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-gray-500">{company.code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{userEmail}</div>
            <div className="text-xs text-gray-500">Premium</div>
          </div>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}

export default Header
