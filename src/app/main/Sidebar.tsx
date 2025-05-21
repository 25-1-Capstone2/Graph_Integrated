'use client'

import { useState } from 'react'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'

type SidebarProps = {
  onSelect: (key: string) => void
}

const Sidebar = ({ onSelect }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const toggleSidebar = () => setIsOpen(!isOpen)

  const menuItems = [
    { label: '대시보드', key: 'dashboard' },
    { label: '관심 종목', key: 'watchlist' },
    { label: '주식차트', key: 'stockchart' },
    { label: '설정', key: 'settings' }
  ]

  return (
    <aside style={{
      width: isOpen ? '220px' : '60px',
      transition: 'width 0.3s ease',
      height: '100vh',
      backgroundColor: '#1f2937',
      color: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: isOpen ? 'flex-start' : 'center',
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        width: '100%',
        marginBottom: '2rem'
      }}>
        {isOpen && <h2 style={{ fontSize: '1.2rem' }}>My Stocks</h2>}
        <button
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', color: '#f9fafb', cursor: 'pointer' }}
        >
          {isOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => onSelect(item.key)}
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '4px',
              backgroundColor: '#374151',
              textAlign: isOpen ? 'left' : 'center'
            }}
          >
            {isOpen ? item.label : item.label.charAt(0)}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
