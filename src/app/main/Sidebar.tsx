'use client'

import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

type SidebarProps = {
  isOpen: boolean
  selectedMenu: string
  setSelectedMenu: (key: string) => void
  toggleSidebar: () => void
}

const menuItems = [
  { label: '대시보드', key: 'dashboard' },
  { label: '관심 종목', key: 'watchlist' },
  { label: '주식차트', key: 'stockchart' },
  { label: '설정', key: 'settings' }
]

const Sidebar = ({ isOpen, selectedMenu, setSelectedMenu }: SidebarProps) => {
  return (
    <aside
      className={`transition-all duration-300 h-full bg-slate-800 text-white ${
        isOpen ? 'w-[220px]' : 'w-0'
      } overflow-hidden relative`}
    >
      <div className={`p-6 ${!isOpen && 'hidden'}`}>
        {/* 메뉴 전체 위치를 박스 기준 아래로 내리기 */}
        <nav className="flex flex-col gap-1.5 mt-[80px]">
          {menuItems.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              className={`w-full justify-start items-start text-white hover:bg-slate-700 px-2 pl-3 h-[40px] ${
                selectedMenu === item.key ? 'bg-slate-600 font-semibold' : ''
              }`}
              onClick={() => setSelectedMenu(item.key)}
            >
              <span className="block translate-y-[12px] text-sm leading-none">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar