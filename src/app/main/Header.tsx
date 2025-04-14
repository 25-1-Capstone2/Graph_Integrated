'use client'

import { useRouter } from 'next/navigation'
import supabase from '../../lib/supabase'

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
    <header style={{ position: 'relative', padding: '1rem' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <span style={{ marginRight: '1rem' }}>{userEmail}님</span>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          로그아웃
        </button>
      </div>
    </header>
  )
}

export default Header
