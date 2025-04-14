'use client'

import { useState } from 'react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify' // react-toastify 추가
import 'react-toastify/dist/ReactToastify.css' // 스타일 추가
// 스타일링 추가
import './styles.css'

const Signup = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {

      toast.success('작성된 이메일에 발송된 이메일 인증을 확인해주세요!.', {
        position: 'top-center',
        autoClose: 1300, // 3초 후 자동으로 사라짐
      })

      // 알림이 끝난 후 로그인 페이지로 리디렉션
      setTimeout(() => {
        router.push('/login')
      }, 2000) // 3초 후 리디렉션
    }
  }

  return (
    <div className="signup-container">
      <h1>회원가입</h1>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}  // 이메일 입력
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}  // 비밀번호 입력
        />
        <button type="submit">회원가입</button>  {/* 회원가입 버튼 */}
      </form>
      {error && <p className="error-message">{error}</p>}  {/* 오류 메시지 출력 */}
      
      {/* 로그인 페이지로 돌아가는 링크 */}
      <div className="switch-login">
        <p>이미 계정이 있으신가요? <a href="/login">로그인</a></p>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Signup
