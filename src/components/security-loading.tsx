"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"

interface SecurityLoadingProps {
  onComplete: () => void
}

const CHECKS = [
  { title: "Verificando credenciais", hint: "Confirmando seu token de acesso..." },
  { title: "Carregando preferências", hint: "Aplicando tema, nome e cliente..." },
  { title: "Preparando painel", hint: "Montando dashboards e relatórios..." },
  { title: "Finalizando", hint: "Conectando aos serviços..." },
]

export default function SecurityLoading({ onComplete }: SecurityLoadingProps) {
  const [step, setStep] = useState(0)
  const progress = ((step + 1) / CHECKS.length) * 100

  useEffect(() => {
    let current = 0
    const timer = setInterval(() => {
      if (current < CHECKS.length - 1) {
        current++
        setStep(current)
      } else {
        clearInterval(timer)
        setTimeout(() => onComplete(), 500)
      }
    }, 950)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/35 to-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* bolhas discretas */}
      <div className="pointer-events-none absolute -top-16 -right-10 w-48 h-48 bg-emerald-100/70 rounded-full blur-2xl" />
      <div className="pointer-events-none absolute bottom-[-40px] left-[-20px] w-64 h-64 bg-emerald-200/50 rounded-full blur-3xl" />

      <div className="w-full max-w-sm bg-white border border-emerald-100/80 rounded-2xl shadow-sm shadow-emerald-50/50 p-6 relative z-10">
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm font-semibold">
              ✔
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Carregando ambiente</p>
              <p className="text-xs text-slate-500">Segure um instante…</p>
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-medium">{Math.round(progress)}%</p>
        </div>

        {/* barra */}
        <Progress value={progress} className="h-1.5 mb-4" />

        {/* texto principal */}
        <p className="text-sm font-medium text-slate-800 mb-1">{CHECKS[step].title}</p>
        <p className="text-xs text-slate-500 mb-5">{CHECKS[step].hint}</p>

        {/* listinha de passos */}
        <div className="flex items-center gap-2 mb-4">
          {CHECKS.map((c, i) => (
            <div
              key={c.title}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= step ? "bg-emerald-500" : "bg-emerald-100"
              }`}
            />
          ))}
        </div>

        {/* rodapézinho */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-200 border-t-emerald-500 animate-spin" />
          <span>Validando acesso seguro ao painel.</span>
        </div>
      </div>
    </div>
  )
}
