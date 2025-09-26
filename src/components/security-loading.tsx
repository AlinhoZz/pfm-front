"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"

interface SecurityLoadingProps {
  onComplete: () => void
}

export default function SecurityLoading({ onComplete }: SecurityLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [currentCheck, setCurrentCheck] = useState("")
  const [currentStep, setCurrentStep] = useState(0)

const securityChecks = [
    { text: "Verificando credenciais", icon: "🛡️" },
    { text: "Carregando dados do usuário", icon: "💻" },
    { text: "Inicializando aplicação", icon: "🚀" },
    { text: "Configurando permissões", icon: "🔧" },
]

  useEffect(() => {
    let step = 0
    const interval = setInterval(() => {
      if (step < securityChecks.length) {
        setCurrentCheck(securityChecks[step].text)
        setCurrentStep(step)
        setProgress((step + 1) * (100 / securityChecks.length))
        step++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          onComplete()
        }, 800)
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#0a8967] rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#07f9a2] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-sm w-full mx-4 text-center relative z-10">
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0a8967] to-[#07f9a2] rounded-xl mx-auto flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-white mb-2">Bem-vindo de volta</h1>
        <p className="text-slate-400 text-sm mb-8">Preparando seu ambiente...</p>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-[#0a8967]/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-sm">{securityChecks[currentStep]?.icon}</span>
            </div>
            <div className="flex-1">
              <Progress value={progress} className="h-1.5" />
            </div>
            <span className="text-[#07f9a2] text-xs ml-3 font-medium">{Math.round(progress)}%</span>
          </div>
          <p className="text-white text-sm text-left">{currentCheck}</p>
        </div>

        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-slate-600 border-t-[#07f9a2] rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )
}
