"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProfileHeader from "@/components/profile-header"
import { AppSidebar } from "@/components/app-sidebar"
import { api } from "@/lib/api"
import { ArrowLeft, Filter, Loader2, ReceiptText } from "lucide-react"

type Option =
  | {
      id?: string
      name?: string
      code?: string
      value?: string
      label?: string
    }
  | string

type RevenuesReport = {
  clientName?: string
  clientEmail?: string
  startDate?: string
  endDate?: string
  totalRevenue?: number
  totalTransactions?: number
  averageRevenue?: number
  revenuesByCategory?: Array<{
    category: string
    total: number
    count: number
    percentage: number
  }>
  revenues?: Array<{
    id: string
    description: string
    amount: number
    datePaid: string
    category?: string
  }>
}

export default function RevenuesReportPage() {
  const router = useRouter()

  const [clientId, setClientId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [category, setCategory] = useState("")
  const [report, setReport] = useState<RevenuesReport | null>(null)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const cid = typeof window !== "undefined" ? localStorage.getItem("clientId") : null

    if (!token || !cid) {
      router.replace("/auth/login")
      return
    }

    setClientId(cid)

    ;(async () => {
      try {
        const res = await api<Option[]>(`/api/categories/revenues`, { auth: true })
        setCategories(Array.isArray(res) ? res : [])
      } catch {
        /* sem categorias */
      }
    })()
  }, [router])

  const normalizeOption = (opt: Option) => {
    if (typeof opt === "string") return { value: opt, label: opt }
    return {
      value: opt.code || opt.id || opt.value || opt.name || "",
      label: opt.name || opt.label || opt.code || opt.value || "",
    }
  }

  const buildReportUrl = (cid: string) => {
    const params = new URLSearchParams()

    if (startDate && endDate) {
      params.set("startDate", startDate)
      params.set("endDate", endDate)
    }

    if (category) {
      params.set("category", category)
    }

    const q = params.toString()
    return q.length > 0 ? `/client/${cid}/revenues/report?${q}` : `/client/${cid}/revenues/report`
  }

  const formatCurrency = (v: number | undefined | null) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v ?? 0)

  const handleGenerate = async () => {
    if (!clientId) return

    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError("Para filtrar por período, informe data inicial e data final.")
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const url = buildReportUrl(clientId)
      const res = await api<RevenuesReport>(url, { auth: true })
      setReport(res || null)
    } catch (e: any) {
      setError(e?.message || "Não foi possível gerar o relatório.")
      setReport(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AppSidebar />

      <div className="flex-1 flex flex-col md:ml-60">
        <ProfileHeader showNotifications />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-0 py-6 space-y-6">
          {/* topo */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Relatórios · Receitas
              </p>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ReceiptText className="w-6 h-6 text-emerald-500" />
                Relatório de receitas
              </h1>
              <p className="text-sm text-slate-500">
                Gere um relatório completo das entradas por período e categoria.
              </p>
            </div>
            <button
              onClick={() => router.push("/revenues")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border text-sm text-slate-700 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para receitas
            </button>
          </div>

          {/* filtros */}
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4 text-slate-600 text-sm">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Data inicial <span className="text-slate-400">(dd/MM/yyyy)</span>
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="01/11/2025"
                  className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Data final <span className="text-slate-400">(dd/MM/yyyy)</span>
                </label>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="30/11/2025"
                  className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">Todas</option>
                  {categories.map((c, idx) => {
                    const opt = normalizeOption(c)
                    return (
                      <option key={idx} value={opt.value}>
                        {opt.label}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleGenerate}
                  className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Gerando...
                    </>
                  ) : (
                    "Gerar relatório"
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">
                {error}
              </p>
            )}
          </div>

          {/* resultado */}
          {report && (
            <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Resultado do relatório</h2>
                  <p className="text-sm text-slate-500">
                    {report.startDate && report.endDate
                      ? `Período: ${report.startDate} até ${report.endDate}`
                      : "Sem período definido"}
                  </p>
                  {report.clientName && (
                    <p className="text-sm text-slate-500">
                      Cliente: {report.clientName}
                      {report.clientEmail ? ` (${report.clientEmail})` : ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Total de receitas
                  </p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">
                    {formatCurrency(report.totalRevenue ?? 0)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Quantidade de lançamentos
                  </p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">
                    {report.totalTransactions ?? 0}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Média por lançamento
                  </p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">
                    {formatCurrency(report.averageRevenue ?? 0)}
                  </p>
                </div>
              </div>

              {report.revenuesByCategory && report.revenuesByCategory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    Resumo por categoria
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                            Categoria
                          </th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                            Total
                          </th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                            Qtde
                          </th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                            %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.revenuesByCategory.map((c) => (
                          <tr key={c.category}>
                            <td className="px-3 py-2">{c.category}</td>
                            <td className="px-3 py-2">{formatCurrency(c.total)}</td>
                            <td className="px-3 py-2">{c.count}</td>
                            <td className="px-3 py-2">{c.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Receitas do período
                </h3>
                {report.revenues && report.revenues.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                            Descrição
                          </th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                            Valor
                          </th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                            Data
                          </th>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                            Categoria
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {report.revenues.map((rev) => (
                          <tr key={rev.id}>
                            <td className="px-3 py-2">{rev.description}</td>
                            <td className="px-3 py-2">{formatCurrency(rev.amount)}</td>
                            <td className="px-3 py-2">{rev.datePaid}</td>
                            <td className="px-3 py-2">{rev.category || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Nenhuma receita retornada para os filtros informados.
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
