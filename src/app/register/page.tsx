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
      sonner.error("A senha deve ter no mínimo 8 caracteres e conter pelo menos uma letra, um número e um símbolo.")
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
        const msg = data?.message || data?.error || (res.status === 400 ? "Erro de validação" : "Não foi possível concluir o cadastro.")
        sonner.error(msg)
        return
      }

      const delay = 3000
      sonner.custom(
        () => (
          <div className="w-full max-w-sm">
            <div className="bg-emerald-600 text-white rounded-md p-4 shadow-md">
              <div className="font-semibold">Conta criada com sucesso!</div>
              <div className="text-sm opacity-90">Bem-vindo, {name}. Redirecionando para o login…</div>
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
    <div className="min-h-screen bg-gradient-to-br from-[#0d192b] via-[#0c5149] to-[#0a8967] flex">
      <Toaster richColors position="top-center" />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8">
        <div
          className="relative w-full max-w-sm"
          style={{ animation: "slideInLeft 0.8s ease-out" }}
        >
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-5 transition-colors lg:hidden">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>

          <Card
            className="border-white/10 bg-white/95 backdrop-blur-xl"
            style={{
              boxShadow: `0 0 0 1px rgba(7, 249, 162, 0.08),
                0 6px 10px -3px rgba(13, 25, 43, 0.10),
                0 14px 22px -6px rgba(13, 25, 43, 0.12),
                0 0 40px rgba(7, 249, 162, 0.04)`,
            }}
          >
            <CardHeader className="text-center pb-5 pt-6">
              <div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#07f9a2] via-[#09c184] to-[#0a8967] mx-auto mb-4 flex items-center justify-center"
                style={{ animation: "pulseGlow 2s ease-in-out infinite alternate", boxShadow: "0 0 16px rgba(7, 249, 162, 0.22)" }}
              >
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-1">Comece sua jornada</CardTitle>
              <CardDescription className="text-gray-600 text-[15px]">
                Crie sua conta e transforme a gestão das suas finanças
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-[#07f9a2] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-[#07f9a2] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha segura"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-[#07f9a2] focus:border-transparent pr-10 text-gray-900 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-gradient-to-r from-[#07f9a2] via-[#09c184] to-[#0a8967] hover:opacity-90 text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] shadow-lg"
                >
                  {isLoading ? "Criando conta..." : "Criar Conta Gratuita"}
                </Button>
              </form>

              <div className="text-center pt-1.5">
                <p className="text-gray-600 text-sm">
                  Já tem uma conta?{" "}
                  <Link href="/auth/login" className="text-[#0a8967] hover:text-[#07f9a2] font-semibold transition-colors">
                    Fazer login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-2 text-center">
            <p className="text-white/70 text-xs">Seus dados estão protegidos com criptografia de ponta</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(7, 249, 162, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(9, 193, 132, 0.03) 0%, transparent 50%),
              linear-gradient(45deg, transparent 49%, rgba(10, 137, 103, 0.02) 50%, transparent 51%)`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-14 text-white" style={{ animation: "slideInRight 0.8s ease-out" }}>
          <div className="mb-6">
            <h2 className="text-4xl font-bold mb-3 leading-tight">
              Transforme seu
              <span className="block text-[#07f9a2]">Negócio Hoje</span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Junte-se a centenas de microempreendedores que já estão organizando suas finanças e crescendo seus negócios.
            </p>
          </div>

          <div className="space-y-5 mt-2">
            <div className="flex items-start" style={{ animation: "slideInRight 0.8s ease-out", animationDelay: "0.15s", animationFillMode: "both" }}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#07f9a2] to-[#09c184] flex items-center justify-center mr-3 flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-0.5">Defina e Alcance Metas</h3>
                <p className="text-gray-300 text-sm">Estabeleça objetivos financeiros e acompanhe seu progresso em tempo real.</p>
              </div>
            </div>

            <div className="flex items-start" style={{ animation: "slideInRight 0.8s ease-out", animationDelay: "0.3s", animationFillMode: "both" }}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#09c184] to-[#0a8967] flex items-center justify-center mr-3 flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-0.5">Sugestões Inteligentes</h3>
                <p className="text-gray-300 text-sm">IA analisa seus padrões e oferece dicas personalizadas para economizar.</p>
              </div>
            </div>

            <div className="flex items-start" style={{ animation: "slideInRight 0.8s ease-out", animationDelay: "0.45s", animationFillMode: "both" }}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0a8967] to-[#0c5149] flex items-center justify-center mr-3 flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-0.5">Relatórios Profissionais</h3>
                <p className="text-gray-300 text-sm">Gere relatórios em PDF e Excel para apresentar a clientes e parceiros.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseGlow { from { box-shadow: 0 0 16px rgba(7, 249, 162, 0.18); } to { box-shadow: 0 0 24px rgba(7, 249, 162, 0.34); } }
        @keyframes slideInLeft { from { transform: translateX(-100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  )
}
