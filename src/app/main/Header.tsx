'use client'

import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabase'
import { Button } from '@/app/components/ui/button'

type Props = {
  userEmail: string
}

const Header = ({ userEmail }: Props) => {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sessionExpirationTime')
    router.push('/login')
  }

  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-end items-center">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{userEmail}님</span>
        <Button variant="destructive" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>
    </header>
  )
}

export default Header
