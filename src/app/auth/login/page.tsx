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
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080")
    : process.env.NEXT_PUBLIC_API_BASE_URL

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
        applyLoginProfile(email, data.token, data.clientId, data.name)
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
    return <SecurityLoading onComplete={() => router.push("/dashboard")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0aa16f] via-[#07895f] to-[#056b4a] flex justify-center items-center relative overflow-hidden">
      {/* elementos de fundo só pra dar o mesmo clima, mas discretos */}
      <div className="pointer-events-none absolute -right-32 -top-28 h-[360px] w-[360px] border-2 border-emerald-200/35 rounded-3xl rotate-6" />
      <div className="pointer-events-none absolute right-12 top-10 h-8 w-8 bg-white/10 rounded-full" />
      <div className="pointer-events-none absolute right-56 bottom-8 h-5 w-5 bg-emerald-100/40 rounded-full" />

      <div className="w-full max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 lg:px-8 relative z-10">
        {/* LADO ESQUERDO - mantém sua ideia, só com cores da landing */}
        <div
          className="relative hidden lg:flex overflow-hidden rounded-2xl bg-emerald-900/5 border border-emerald-50/10"
          style={{ animation: "slideInLeft 0.8s ease-out" }}
        >
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.025) 0%, transparent 55%),
                linear-gradient(135deg, rgba(5,107,74,0.25) 0%, rgba(10,161,111,0) 50%)`,
            }}
          />
          <div className="relative z-10 flex flex-col justify-center px-10 py-10 text-white">
            <div className="mb-5">
              <div className="flex items-center mb-4">
                <div className="mr-4 flex items-center justify-center">
                  <img src="/icons/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Gestão Financeira Inteligente</h1>
              </div>
              <p className="text-base text-emerald-50/90 leading-relaxed max-w-md">
                Plataforma para microempreendedores controlarem receitas, despesas e metas.
              </p>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex items-start">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-base text-white">Controle de fluxo de caixa</h3>
              </div>

              <div className="flex items-start">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-base text-white">Relatórios em 1 clique</h3>
              </div>

              <div className="flex items-start">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-base text-white">Sugestões de IA para metas</h3>
              </div>
            </div>

            {/* badge no mesmo tom do amarelo da landing */}
            <div className="mt-10 inline-flex items-center gap-3 bg-[#f9d34f] text-emerald-950 px-5 py-3 rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <span className="text-2xl font-bold leading-none">33%</span>
              <span className="text-[11px] uppercase tracking-[0.3em] leading-tight">mais conversões</span>
            </div>
          </div>
        </div>

        {/* LADO DIREITO - o seu card, só trocando cores para o verde+preto da landing */}
        <div className="w-full flex items-center justify-center" style={{ animation: "slideInRight 0.8s ease-out" }}>
          <div className="relative w-full max-w-md">
            <Link href="/" className="inline-flex items-center text-emerald-50/90 hover:text-white mb-5 transition-colors lg:hidden">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Link>

            <Card
              className="border-emerald-50/10 bg-white/95 backdrop-blur-xl"
              style={{
                boxShadow: `0 0 0 1px rgba(5,107,74,0.05),
                  0 8px 12px -3px rgba(0,0,0,0.06),
                  0 18px 28px -6px rgba(0,0,0,0.08)`,
              }}
            >
              <CardHeader className="text-center pb-6">
                <div
                  className="w-16 h-16 rounded-full bg-[#0e5e64] mx-auto mb-5 flex items-center justify-center"
                  style={{ animation: "pulseGlow 2s ease-in-out infinite alternate" }}
                >
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-[#0e5e64] mb-1">Bem-vindo de volta</CardTitle>
                <CardDescription className="text-slate-500 text-base">
                  Acesse sua conta e continue gerenciando suas finanças
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-white border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 bg-white border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent pr-12 text-slate-900 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-[#0e5e64] hover:bg-[#0b4f54] text-white font-semibold text-base transition-all duration-200 rounded-full"
                  >
                    {isLoading ? "Entrando..." : "Entrar na Plataforma"}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-slate-600">
                    Não tem uma conta?{" "}
                    <Link href="/auth/register" className="text-emerald-700 hover:text-emerald-600 font-semibold transition-colors">
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
        @keyframes pulseGlow {
          from { box-shadow: 0 0 12px rgba(15, 23, 42, 0.08); }
          to { box-shadow: 0 0 20px rgba(15, 23, 42, 0.16); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(60px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
