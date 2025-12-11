"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProfileHeader from "@/components/profile-header"
import { AppSidebar } from "@/components/app-sidebar"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Loader2,
  PiggyBank,
  Target,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react"

type Transaction = {
  id: string
  date: string // yyyy-MM-dd
  amount: number
  category: string
  description: string
  recurring: boolean
}

type Revenue = {
  id: string
  date: string
  amount: number
  source: string
}

type MetaReport = {
  id: string
  name: string
  target: number
  accumulated: number
  progressPercentage: number
  deadline: string // yyyy-MM-dd
}

type FinancialReport = {
  transactions: Transaction[]
  revenues: Revenue[]
  metas: MetaReport[]
  report_id: string
  user_id: number
  period_start: string
  period_end: string
}

type Recommendation = {
  rank: number
  message_short: string
  message_detail: string
}

type AiReportResponse = {
  report: FinancialReport
  recommendations: Recommendation[]
  has_recommendations: boolean
  recommendations_count: number
}

// helper para yyyy-MM-dd
function formatDateInput(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

// deixa o título da recomendação mais amigável
function formatRecommendationShort(rec: Recommendation): string {
  let t = rec.message_short || ""

  // trocar 1.0% -> 1,0%
  t = t.replace(/(\d+)\.(\d+)%/g, "$1,$2%")

  // remover UUID depois de "meta:"
  t = t.replace(/(meta:)\s*[0-9a-fA-F-]+\s*—/i, "meta —")

  return t.trim()
}

// limpa o texto detalhado da IA para o usuário final
function formatRecommendationDetail(rec: Recommendation): string {
  let text = rec.message_detail || rec.message_short || ""

  // cortar tudo depois de "Confiança:"
  const confIdx = text.indexOf("Confiança:")
  if (confIdx !== -1) {
    text = text.slice(0, confIdx)
  }

  // cortar tudo depois de "Principais sinais:"
  const sinaisIdx = text.indexOf("Principais sinais:")
  if (sinaisIdx !== -1) {
    text = text.slice(0, sinaisIdx)
  }

  // remover marcação ** **
  text = text.replace(/\*\*/g, "")

  // ajustar prazo "None meses"
  text = text.replace(/None meses/gi, "sem prazo definido")

  // transformar "Meta <uuid>" em "Uma das suas metas"
  text = text.replace(
    /Meta\s+[0-9a-fA-F-]{10,}/gi,
    "Uma das suas metas",
  )
  text = text.replace(/Meta\s+/gi, "Uma das suas metas ")

  // 100.0% -> 100,0%
  text = text.replace(/(\d+)\.(\d+)%/g, "$1,$2%")

  // R$ 500.00 -> R$ 500,00
  text = text.replace(/R\$\s?(\d+)\.(\d{2})/g, "R$ $1,$2")

  // tirar espaços extras
  text = text.replace(/\s+/g, " ").trim()

  return text
}

export default function FinancialAiReportPage() {
  const router = useRouter()

  const [clientId, setClientId] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [useAi, setUseAi] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [report, setReport] = useState<FinancialReport | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [hasRecommendations, setHasRecommendations] = useState(false)

  // carregar clientId + datas padrão (últimos 30 dias)
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null
    const cid =
      typeof window !== "undefined" ? localStorage.getItem("clientId") : null

    if (!token || !cid) {
      router.replace("/login")
      return
    }

    setClientId(cid)

    const today = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 1)

    setStartDate(formatDateInput(start))
    setEndDate(formatDateInput(today))
  }, [router])

  const formatCurrency = (v: number | undefined | null) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v ?? 0)

  const formatDateBR = (d: string) => {
    if (!d) return ""
    if (d.includes("/")) return d
    if (d.includes("-")) {
      const [yyyy, mm, dd] = d.split("-")
      return `${dd}/${mm}/${yyyy}`
    }
    return d
  }

  const handleGenerate = async () => {
    if (!clientId) return
    setError(null)

    if (!startDate || !endDate) {
      setError("Informe a data inicial e final.")
      return
    }

    if (startDate > endDate) {
      setError("A data inicial não pode ser maior que a data final.")
      return
    }

    setLoading(true)

    try {
      if (useAi) {
        const res = await api<AiReportResponse>(
          `/client/${clientId}/financial-report/with-recommendations?startDate=${startDate}&endDate=${endDate}&shapTopK=5`,
          { auth: true },
        )

        setReport(res.report || null)
        setRecommendations(res.recommendations || [])
        setHasRecommendations(
          !!res.has_recommendations &&
            (res.recommendations_count ??
              res.recommendations?.length ??
              0) > 0,
        )
      } else {
        const res = await api<FinancialReport>(
          `/client/${clientId}/financial-report?startDate=${startDate}&endDate=${endDate}`,
          { auth: true },
        )

        setReport(res || null)
        setRecommendations([])
        setHasRecommendations(false)
      }
    } catch (e: any) {
      setError(String(e?.message || "Não foi possível gerar o relatório."))
    } finally {
      setLoading(false)
    }
  }

  // agregados
  let totalRevenues = 0
  let totalExpenses = 0
  let balance = 0
  let metasCount = 0
  let metasAvgProgress = 0

  if (report) {
    totalRevenues = (report.revenues || []).reduce(
      (sum, r) => sum + (r.amount || 0),
      0,
    )
    totalExpenses = (report.transactions || []).reduce(
      (sum, t) => sum + (t.amount || 0),
      0,
    )
    balance = totalRevenues - totalExpenses

    metasCount = report.metas?.length || 0
    if (metasCount > 0) {
      const totalProgress = report.metas.reduce(
        (sum, m) => sum + (m.progressPercentage || 0),
        0,
      )
      metasAvgProgress = totalProgress / metasCount
    }
  }

  const periodLabel =
    report?.period_start && report?.period_end
      ? `${formatDateBR(report.period_start)} a ${formatDateBR(
          report.period_end,
        )}`
      : startDate && endDate
        ? `${formatDateBR(startDate)} a ${formatDateBR(endDate)}`
        : ""

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AppSidebar />

      <div className="flex-1 flex flex-col md:ml-60">
        <ProfileHeader showNotifications />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-0 py-6 space-y-6">
          {/* Topo */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Relatórios · Análise com IA
              </p>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                Visão inteligente das finanças
              </h1>
              <p className="text-sm text-slate-500 max-w-xl">
                Gere um relatório do período selecionado e, se quiser, ative a
                IA para receber insights e recomendações sobre seus gastos,
                receitas e metas.
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border text-sm text-slate-700 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </div>

          {/* Filtro / Configuração */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Período de análise
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9 rounded border border-slate-200 px-2 text-xs sm:text-sm"
                      />
                      <span className="text-xs text-slate-400">até</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-9 rounded border border-slate-200 px-2 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle IA */}
              <div className="flex flex-col items-start sm:items-end gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Modo de relatório
                </span>
                <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setUseAi(false)}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      !useAi
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Simples
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseAi(true)}
                    className={`px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${
                      useAi
                        ? "bg-white shadow-sm text-emerald-700"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    IA ativa
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !startDate || !endDate}
                  className="mt-1 inline-flex items-center gap-2 px-4 h-9 rounded-full bg-emerald-500 text-white text-xs sm:text-sm hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando relatório...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Gerar relatório
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-2 flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 mt-[2px]" />
                <span>{error}</span>
              </div>
            )}

            {useAi && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                As recomendações são sugestões automáticas com base no seu
                histórico. Use como apoio, não como conselho financeiro
                definitivo.
              </p>
            )}
          </div>

          {/* Conteúdo do relatório */}
          {!report ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500">
              Selecione um período e clique em{" "}
              <span className="font-semibold text-slate-900">
                &quot;Gerar relatório&quot;
              </span>{" "}
              para visualizar a análise das suas finanças.
            </div>
          ) : (
            <>
              {/* Cards de resumo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Receitas no período
                    </span>
                    <PiggyBank className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    {formatCurrency(totalRevenues)}
                  </p>
                  {periodLabel && (
                    <p className="text-[11px] text-slate-400">{periodLabel}</p>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Despesas no período
                    </span>
                    <CreditCard className="w-5 h-5 text-rose-500" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    {formatCurrency(totalExpenses)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Inclui transações recorrentes
                  </p>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-50">
                      Saldo do período
                    </span>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-xl font-semibold">
                    {formatCurrency(balance)}
                  </p>
                  <p className="text-[11px] text-emerald-50">
                    Receitas − Despesas
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Metas acompanhadas
                    </span>
                    <Target className="w-5 h-5 text-sky-500" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    {metasCount}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Progresso médio:{" "}
                    <span className="font-semibold">
                      {metasCount > 0 ? metasAvgProgress.toFixed(1) : "0.0"}%
                    </span>
                  </p>
                </div>
              </div>

              {/* Layout principal: IA (se tiver) + transações/receitas/metas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-10">
                {/* Coluna esquerda: IA + metas */}
                <div className="space-y-4 lg:col-span-1">
                  {useAi && hasRecommendations && recommendations.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-emerald-500 mb-1">
                            Recomendações da IA
                          </p>
                          <h2 className="text-sm font-semibold text-slate-900">
                            O que a IA observou nas suas finanças
                          </h2>
                        </div>
                      </div>
                      <div className="mt-3 space-y-3 max-h-64 overflow-auto pr-1">
                        {recommendations.map((rec) => (
                          <div
                            key={rec.rank}
                            className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2"
                          >
                            <p className="text-[11px] text-emerald-600 font-semibold mb-1">
                              #{rec.rank + 1} · {formatRecommendationShort(rec)}
                            </p>
                            <p className="text-xs text-emerald-900">
                              {formatRecommendationDetail(rec)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                          Metas financeiras
                        </p>
                        <h2 className="text-sm font-semibold text-slate-900">
                          Progresso das metas no período
                        </h2>
                      </div>
                    </div>

                    {report.metas?.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Nenhuma meta vinculada neste relatório.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3 max-h-64 overflow-auto pr-1">
                        {report.metas.map((meta) => (
                          <div
                            key={meta.id}
                            className="border border-slate-100 rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {meta.name}
                              </p>
                              <span className="text-[11px] text-slate-400">
                                até {formatDateBR(meta.deadline)}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 mb-1">
                              Alvo:{" "}
                              <span className="font-medium text-slate-900">
                                {formatCurrency(meta.target)}
                              </span>{" "}
                              · Acumulado:{" "}
                              <span className="font-medium text-slate-900">
                                {formatCurrency(meta.accumulated)}
                              </span>
                            </p>

                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(
                                    Math.max(meta.progressPercentage || 0, 0),
                                    100,
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Progresso:{" "}
                              <span className="font-semibold text-slate-900">
                                {meta.progressPercentage.toFixed(1)}%
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Coluna direita (2 colunas em lg): transações e receitas */}
                <div className="space-y-4 lg:col-span-2">
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                          Despesas
                        </p>
                        <h2 className="text-sm font-semibold text-slate-900">
                          Transações no período
                        </h2>
                      </div>
                    </div>

                    {report.transactions?.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Nenhuma transação encontrada neste período.
                      </p>
                    ) : (
                      <div className="mt-3 max-h-64 overflow-auto">
                        <table className="w-full text-xs text-slate-600">
                          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="text-left py-2 px-2 font-medium">
                                Data
                              </th>
                              <th className="text-left py-2 px-2 font-medium">
                                Categoria
                              </th>
                              <th className="text-left py-2 px-2 font-medium">
                                Descrição
                              </th>
                              <th className="text-right py-2 px-2 font-medium">
                                Valor
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.transactions.map((t) => (
                              <tr
                                key={t.id}
                                className="border-b border-slate-50 last:border-0"
                              >
                                <td className="py-1.5 px-2 whitespace-nowrap">
                                  {formatDateBR(t.date)}
                                </td>
                                <td className="py-1.5 px-2 whitespace-nowrap">
                                  {t.category}
                                  {t.recurring && (
                                    <span className="ml-1 text-[10px] text-slate-400">
                                      · recorrente
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5 px-2 max-w-[180px] truncate">
                                  {t.description}
                                </td>
                                <td className="py-1.5 px-2 text-right text-rose-600 font-medium">
                                  {formatCurrency(t.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                          Receitas
                        </p>
                        <h2 className="text-sm font-semibold text-slate-900">
                          Entradas no período
                        </h2>
                      </div>
                    </div>

                    {report.revenues?.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        Nenhuma receita encontrada neste período.
                      </p>
                    ) : (
                      <div className="mt-3 max-h-56 overflow-auto">
                        <table className="w-full text-xs text-slate-600">
                          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="text-left py-2 px-2 font-medium">
                                Data
                              </th>
                              <th className="text-left py-2 px-2 font-medium">
                                Origem
                              </th>
                              <th className="text-right py-2 px-2 font-medium">
                                Valor
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.revenues.map((r) => (
                              <tr
                                key={r.id}
                                className="border-b border-slate-50 last:border-0"
                              >
                                <td className="py-1.5 px-2 whitespace-nowrap">
                                  {formatDateBR(r.date)}
                                </td>
                                <td className="py-1.5 px-2 max-w-[200px] truncate">
                                  {r.source}
                                </td>
                                <td className="py-1.5 px-2 text-right text-emerald-600 font-medium">
                                  {formatCurrency(r.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
