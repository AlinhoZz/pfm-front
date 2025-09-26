"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, ArrowLeft, DollarSign, BarChart3, FileText, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { applyLoginProfile } from "@/lib/auth-profile"
import SecurityLoading from "@/components/security-loading"

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080")
    : process.env.NEXT_PUBLIC_API_URL

export default function LoginPage() {
  const router = useRouter()
  const { success, error } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [phase, setPhase] = useState<"form" | "security">("form")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const url = new URL("/auth/login", API_BASE as string).toString()
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.token) {
        applyLoginProfile(email, data.token)
        success({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema de gestão financeira.",
          duration: 1200,
        })
        setPhase("security")
      } else {
        error({
          title: "Erro no login",
          description:
            typeof data?.message === "string"
              ? data.message
              : "Verifique suas credenciais e tente novamente.",
          duration: 3500,
        })
      }
    } catch {
      error({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        duration: 3500,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (phase === "security") {
    return <SecurityLoading onComplete={() => router.push("/finance-info")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d192b] via-[#0c5149] to-[#0a8967] flex justify-center items-center">
      <div className="w-full max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 lg:px-8">
        <div className="relative hidden lg:flex overflow-hidden rounded-2xl" style={{ animation: "slideInLeft 0.8s ease-out" }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(7, 249, 162, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(9, 193, 132, 0.03) 0%, transparent 50%),
                linear-gradient(45deg, transparent 49%, rgba(10, 137, 103, 0.02) 50%, transparent 51%)`,
            }}
          />
          <div className="relative z-10 flex flex-col justify-center px-10 text-white">
            <div className="mb-5">
              <div className="flex items-center mb-4">
                <div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#07f9a2] via-[#09c184] to-[#0a8967] flex items-center justify-center mr-4"
                  style={{ animation: "pulseGlow 2s ease-in-out infinite alternate", boxShadow: "0 0 20px rgba(7, 249, 162, 0.2)" }}
                >
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold">Gestão Financeira Inteligente</h1>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                Plataforma completa para microempreendedores controlarem suas finanças com facilidade e precisão.
              </p>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex items-start">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#07f9a2] to-[#09c184] flex items-center justify-center mr-3 flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-white">Controle de receitas e despesas</h3>
              </div>

              <div className="flex items-start">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#09c184] to-[#0a8967] flex items-center justify-center mr-3 flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-white">Relatórios profissionais</h3>
              </div>

              <div className="flex items-start">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0a8967] to-[#0c5149] flex items-center justify-center mr-3 flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-white">Sugestões inteligentes</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center" style={{ animation: "slideInRight 0.8s ease-out" }}>
          <div className="relative w-full max-w-md">
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-5 transition-colors lg:hidden">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Link>

            <Card
              className="border-white/10 bg-white/95 backdrop-blur-xl"
              style={{
                boxShadow: `0 0 0 1px rgba(7, 249, 162, 0.1),
                  0 8px 12px -3px rgba(13, 25, 43, 0.12),
                  0 18px 28px -6px rgba(13, 25, 43, 0.14),
                  0 0 50px rgba(7, 249, 162, 0.05)`,
              }}
            >
              <CardHeader className="text-center pb-6">
                <div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#07f9a2] via-[#09c184] to-[#0a8967] mx-auto mb-5 flex items-center justify-center"
                  style={{ animation: "pulseGlow 2s ease-in-out infinite alternate", boxShadow: "0 0 20px rgba(7, 249, 162, 0.2)" }}
                >
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-1">Bem-vindo de volta</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Acesse sua conta e continue gerenciando suas finanças
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-[#07f9a2] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 bg-white border-gray-200 focus:ring-2 focus:ring-[#07f9a2] focus:border-transparent pr-12 text-gray-900 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-[#07f9a2] via-[#09c184] to-[#0a8967] hover:opacity-90 text-white font-semibold text-base transition-all duration-200 hover:scale-[1.02] shadow-lg"
                  >
                    {isLoading ? "Entrando..." : "Entrar na Plataforma"}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-gray-600">
                    Não tem uma conta?{" "}
                    <Link href="/register" className="text-[#0a8967] hover:text-[#07f9a2] font-semibold transition-colors">
                      Criar conta gratuita
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseGlow { from { box-shadow: 0 0 20px rgba(7, 249, 162, 0.2); } to { box-shadow: 0 0 30px rgba(7, 249, 162, 0.4); } }
        @keyframes slideInLeft { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  )
}
