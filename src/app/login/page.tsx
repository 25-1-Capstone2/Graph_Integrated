"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Eye, EyeOff, Mail, Lock, ArrowRight, TrendingUp, BarChart3, DollarSign } from "lucide-react"
import supabase from "../../lib/supabase"  // 경로는 프로젝트에 맞게 조정하세요

const Login = () => {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push("/main")
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupRedirect = () => {
    router.push("/signup")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 차트 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="chart-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M10,80 Q30,20 50,40 T90,30" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.3" />
              <circle cx="10" cy="80" r="2" fill="#10b981" opacity="0.5" />
              <circle cx="30" cy="35" r="2" fill="#10b981" opacity="0.5" />
              <circle cx="50" cy="40" r="2" fill="#10b981" opacity="0.5" />
              <circle cx="70" cy="25" r="2" fill="#10b981" opacity="0.5" />
              <circle cx="90" cy="30" r="2" fill="#10b981" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chart-pattern)" />
        </svg>
      </div>

      {/* 플로팅 아이콘들 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 animate-bounce delay-1000">
          <TrendingUp className="w-8 h-8 text-emerald-400/20" />
        </div>
        <div className="absolute top-40 right-32 animate-pulse delay-2000">
          <BarChart3 className="w-6 h-6 text-emerald-300/20" />
        </div>
        <div className="absolute bottom-32 left-32 animate-bounce delay-3000">
          <DollarSign className="w-7 h-7 text-yellow-400/20" />
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse delay-500">
          <TrendingUp className="w-5 h-5 text-emerald-500/20" />
        </div>
      </div>

      <Card className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 relative z-10">
        <CardHeader className="text-center space-y-4 pb-2">
          {/* 로고 */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/30 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/20 to-transparent rounded-2xl"></div>
            <TrendingUp className="w-10 h-10 text-white relative z-10" />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-yellow-400 bg-clip-text text-transparent tracking-tight">
              StockPredictor
            </CardTitle>
            <p className="text-slate-400 text-sm font-medium">스마트한 투자의 시작</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 py-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400 text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                이메일
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 h-12"
                  required
                  autoComplete="email"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-focus-within:from-emerald-500/10 group-focus-within:via-emerald-500/5 group-focus-within:to-emerald-500/10 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-400 text-sm font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                비밀번호
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200 h-12 pr-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-focus-within:from-emerald-500/10 group-focus-within:via-emerald-500/5 group-focus-within:to-emerald-500/10 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-900/20 border-red-500/30 text-red-300 animate-in slide-in-from-top-2 duration-300">
                <AlertDescription>
                  <span className="text-sm">{error}</span>
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-slate-100 font-semibold py-3 h-12 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  로그인 중...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2 relative z-10">
                  로그인
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-500">또는</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-slate-700 bg-slate-800/70 text-slate-300 hover:bg-slate-700/50 hover:text-emerald-400 hover:border-emerald-500/50 transition-all duration-200 font-semibold h-12 group"
            onClick={handleSignupRedirect}
          >
            <span className="flex items-center justify-center gap-2">
              회원가입
              <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </span>
          </Button>

          {/* 하단 장식 */}
          <div className="text-center pt-4">
            <p className="text-xs text-slate-600">안전하고 스마트한 투자 플랫폼</p>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                실시간 데이터
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
                보안 인증
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
