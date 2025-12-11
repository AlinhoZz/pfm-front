"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react"
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
      sonner.error("A senha deve ter 8+ caracteres e conter letra, número e símbolo.")
      return
    }

    setIsLoading(true)
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
      const res = await fetch(`${base}/register`, {
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

      const delay = 2600
      sonner.success("Conta criada com sucesso! Redirecionando...", { duration: delay })
      setTimeout(() => router.push("/login"), delay)
    } catch {
      sonner.error("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Toaster richColors position="top-center" />

      {/* metade imagem */}
      <div className="hidden md:block md:w-1/2 relative animate-imageEnter">
        <div
          className="absolute inset-0 bg-[url('/icons/registro.png')] bg-cover bg-center"
          aria-hidden
        />
        <div className="absolute inset-0 bg-emerald-900/10" aria-hidden />
      </div>

      {/* metade form */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 animate-formEnter">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-600/80">
              <span className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </span>
              <span className="text-xs font-medium">Criar nova conta</span>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </div>

          <div className="mb-7 text-center">
            <h1 className="text-3xl font-bold text-emerald-900 leading-none mb-1">Registrar</h1>
            <p className="text-emerald-700/80 text-sm">Comece a controlar suas finanças</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-emerald-900">
                Nome completo
              </Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 bg-emerald-50 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
              />
            </div>

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
                className="h-11 bg-emerald-50 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
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
                  placeholder="Crie uma senha segura"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-emerald-50 border-emerald-200 text-emerald-950 placeholder:text-emerald-900/80 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 pr-11"
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
              <p className="text-[11px] text-emerald-900/60">
                Mín. 8 caracteres, com letra, número e símbolo.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </Button>

            <p className="text-center text-sm text-emerald-900/80">
              Já tem conta?{" "}
              <Link href="/login" className="text-emerald-700 hover:text-emerald-900 font-semibold">
                Fazer login
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        .animate-formEnter {
          animation: formEnter 0.45s ease-out;
        }
        .animate-imageEnter {
          animation: imageEnter 0.45s ease-out;
        }
        @keyframes formEnter {
          from {
            opacity: 0;
            transform: translateX(18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes imageEnter {
          from {
            opacity: 0;
            transform: translateX(-18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
