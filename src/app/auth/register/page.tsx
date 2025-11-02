"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, ArrowLeft, UserPlus, Target, Lightbulb, FileText } from "lucide-react"
import { toast as sonner, Toaster } from "sonner"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (name.trim().length < 3) {
      sonner.error("Nome deve ter no mínimo 3 caracteres")
      return
    }

    if (!strongPassword.test(password)) {
      sonner.error("A senha deve ter no mínimo 8 caracteres e conter letra, número e símbolo.")
      return
    }

    setIsLoading(true)
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
      const res = await fetch(`${base}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      let data: any = {}
      try {
        data = await res.json()
      } catch {}

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          (res.status === 400 ? "Erro de validação" : "Não foi possível concluir o cadastro.")
        sonner.error(msg)
        return
      }

      const delay = 3000
      sonner.custom(
        () => (
          <div className="w-full max-w-sm">
            <div className="bg-emerald-600 text-white rounded-md p-4 shadow-md">
              <div className="font-semibold">Conta criada com sucesso!</div>
              <div className="text-sm opacity-90">Bem-vindo, {name}. Redirecionando…</div>
              <div className="mt-3 h-1 w-full bg-white/30 rounded overflow-hidden">
                <div
                  className="h-full bg-white animate-[shrink_linear_forwards]"
                  style={{ animationDuration: `${delay}ms` } as React.CSSProperties}
                />
              </div>
            </div>
          </div>
        ),
        { duration: delay }
      )

      setTimeout(() => router.push("/auth/login"), delay)
    } catch {
      sonner.error("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0aa16f] via-[#07895f] to-[#056b4a] relative overflow-hidden">
      <Toaster richColors position="top-center" />

      {/* shapes iguais do login */}
      <div className="pointer-events-none absolute -right-32 -top-28 h-[360px] w-[360px] border-2 border-emerald-200/35 rounded-3xl rotate-6" />
      <div className="pointer-events-none absolute right-10 top-10 h-8 w-8 bg-white/10 rounded-full" />
      <div className="pointer-events-none absolute right-56 bottom-6 h-5 w-5 bg-emerald-100/40 rounded-full" />

      {/* COLUNA FORM */}
<div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end px-6 lg:px-8">
  <div
    className="relative w-full max-w-md"
    style={{ animation: "slideInLeft 0.8s ease-out" }}
  >
          <Link
            href="/"
            className="inline-flex items-center text-emerald-50/90 hover:text-white mb-5 transition-colors lg:hidden"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>

          <Card
            className="border-emerald-50/10 bg-white/95 backdrop-blur-xl"
            style={{
              boxShadow: `0 0 0 1px rgba(5,107,74,0.05),
                0 6px 10px -3px rgba(0,0,0,0.04),
                0 14px 22px -6px rgba(0,0,0,0.06)`,
            }}
          >
            <CardHeader className="text-center pb-5 pt-6">
                <div
                  className="w-14 h-14 rounded-full bg-[#0e5e64] mx-auto mb-4 flex items-center justify-center"
                  style={{ animation: "pulseGlow 2s ease-in-out infinite alternate" }}
                >
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#0e5e64] mb-1">Criar conta</CardTitle>
                <CardDescription className="text-slate-500 text-[15px]">
                  Cadastre-se para começar a controlar suas finanças
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-10 bg-white border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                  />
                </div>

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
                    className="h-10 bg-white border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-slate-900 placeholder:text-slate-400"
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
                      placeholder="Crie uma senha segura"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 bg-white border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-transparent pr-10 text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-[#0e5e64] hover:bg-[#0b4d51] text-white font-semibold text-sm transition-all duration-200 rounded-full"
                >
                  {isLoading ? "Criando conta..." : "Criar conta gratuita"}
                </Button>
              </form>

              <div className="text-center pt-1.5">
                <p className="text-slate-600 text-sm">
                  Já tem uma conta?{" "}
                  <Link href="/auth/login" className="text-emerald-700 hover:text-emerald-600 font-semibold transition-colors">
                    Fazer login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-2 text-center">
            <p className="text-emerald-50/75 text-xs">Seus dados estão protegidos com criptografia de ponta</p>
          </div>
        </div>
      </div>

      {/* COLUNA TEXTO / VITRINE */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.025) 0%, transparent 50%),
              linear-gradient(135deg, rgba(5,107,74,0.25) 0%, rgba(10,161,111,0) 50%)`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-14 text-white" style={{ animation: "slideInRight 0.8s ease-out" }}>
          <div className="mb-6">
            <h2 className="text-4xl font-bold mb-3 leading-tight">
              Organize hoje,
              <span className="block text-[#f9d34f]">cresça amanhã.</span>
            </h2>
            <p className="text-lg text-emerald-50/90 leading-relaxed">
              Crie seu acesso e tenha controle do que entra, do que sai e do que pode investir.
            </p>
          </div>

          <div className="space-y-5 mt-2">
            <div className="flex items-start">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mr-3 flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-0.5">Metas financeiras claras</h3>
                <p className="text-emerald-50/85 text-sm">Defina objetivos e acompanhe seu progresso mensal.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mr-3 flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-0.5">Sugestões inteligentes</h3>
                <p className="text-emerald-50/85 text-sm">IA ajuda a ajustar gastos e priorizar o que importa.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mr-3 flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-0.5">Relatórios profissionais</h3>
                <p className="text-emerald-50/85 text-sm">Compartilhe com parceiros, cliente ou contador.</p>
              </div>
            </div>
          </div>

          {/* badge amarelo igual ao login */}
          <div className="mt-10 inline-flex items-center gap-3 bg-[#f9d34f] text-emerald-950 px-5 py-3 rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <span className="text-2xl font-bold leading-none">33%</span>
            <span className="text-[11px] uppercase tracking-[0.3em] leading-tight">mais conversões</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseGlow {
          from { box-shadow: 0 0 12px rgba(15, 23, 42, 0.08); }
          to { box-shadow: 0 0 20px rgba(15, 23, 42, 0.16); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
