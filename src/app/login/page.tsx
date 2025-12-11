"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { applyLoginProfile } from "@/lib/auth-profile"
import SecurityLoading from "@/components/security-loading"

const API_BASE =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_BASE_URL

export default function LoginPage() {
  const router = useRouter()
  const { success, error } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [phase, setPhase] = useState<"form" | "security">("form")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const url = new URL("/login", API_BASE as string).toString()
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok && data?.token) {
        applyLoginProfile(email, data.token, data.clientId, data.name)
        success({
          title: "Login realizado!",
          description: "Preparando seu painel...",
          duration: 1500,
        })
        setPhase("security")
      } else {
        error({
          title: "Erro no login",
          description:
            typeof data?.message === "string"
              ? data.message
              : "Verifique email e senha e tente novamente.",
          duration: 3500,
        })
      }
    } catch {
      error({
        title: "Erro de conexão",
        description: "Não foi possível falar com o servidor.",
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
    <div className="min-h-screen flex bg-slate-50">
      {/* LADO DA IMAGEM */}
      <div className="hidden md:block md:w-1/2 relative">
        <div
          className="absolute inset-0 bg-[url('/icons/login.png')] bg-cover bg-center"
          aria-hidden
        />
        <div className="absolute inset-0 bg-emerald-900/15" aria-hidden />
      </div>

      {/* LADO DO FORM */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 animate-[fadeUp_.4s_ease-out]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-600/80">
              <span className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-medium">Acesso seguro</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900"
            >
              ← Voltar
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-emerald-900 leading-none mb-1">Entrar</h1>
            <p className="text-emerald-700/80 text-sm">Acesse sua conta financeira</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-emerald-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-emerald-50 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/95 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-emerald-900">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-emerald-50 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/95 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-800/70 hover:text-emerald-900"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="remember" className="text-sm text-emerald-700">
                Lembrar-me
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <Link href="/register" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-full mt-0.5"
              >
                Criar conta
              </Button>
            </Link>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
