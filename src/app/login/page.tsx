'use client' // 클라이언트 사이드에서 실행되도록 지정

import { useState } from 'react'
import supabase from '../../lib/supabase'
import { useRouter } from 'next/navigation'
// 스타일링 추가
import './styles.css'

const Login = () => {
  const [email, setEmail] = useState<string>('') 
  const [password, setPassword] = useState<string>('') 
  const [error, setError] = useState<string | null>(null) 
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // 수정된 부분: 반환 값에서 data와 error를 분리하여 사용
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)  // 로그인 오류 처리
    } else {
      router.push('/main')  // 로그인 후 메인 화면으로 리디렉션
    }
  }

    // 회원가입 페이지로 이동하는 함수
    const handleSignupRedirect = () => {
      router.push('/signup') // 회원가입 페이지로 리디렉션
    }

    return (
      <div className="login-container">
        <h1>로그인</h1>
        <form onSubmit={handleLogin}>
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
          <button type="submit">로그인</button>  {/* 로그인 버튼 */}
        </form>
        {error && <p className="error-message">{error}</p>}  {/* 오류 메시지 출력 */}
        {/* 회원가입 버튼 추가 */}
        <button className="signup-button" onClick={handleSignupRedirect}>회원가입</button>
      </div>
    )
}

export default Login
