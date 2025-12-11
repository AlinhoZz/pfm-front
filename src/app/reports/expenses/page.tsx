"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProfileHeader from "@/components/profile-header"
import { AppSidebar } from "@/components/app-sidebar"
import { api } from "@/lib/api"
import { ArrowLeft, FileDown, Filter, Loader2, ReceiptText } from "lucide-react"

type Option =
  | {
      id?: string
      name?: string
      code?: string
      value?: string
      label?: string
    }
  | string

type ExpenseReport = {
  clientName?: string
  clientEmail?: string
  startDate?: string
  endDate?: string
  totalAmount?: number
  totalExpenses?: number | null
  totalTransactions?: number | null
  expenses?: Array<{
    id: string
    description: string
    amount: number
    datePaid: string
    category?: string
    paymentMethod?: string
  }>
  categorySummary?: Array<{
    category: string
    total: number
    count: number
    percentage: number
  }>
}

export default function ExpensesReportPage() {
  const router = useRouter()

  const [clientId, setClientId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [category, setCategory] = useState("")
  const [report, setReport] = useState<ExpenseReport | null>(null)

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
        const res = await api<Option[]>(`/api/categories/expenses`, { auth: true })
        setCategories(Array.isArray(res) ? res : [])
      } catch {
        /* ignore */
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

    const query = params.toString()
    return query.length > 0
      ? `/client/${cid}/expenses/report?${query}`
      : `/client/${cid}/expenses/report`
  }

  const handleGenerate = async () => {
    if (!clientId) return
    setError(null)

    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError("Para filtrar por período, informe data inicial e data final.")
      return
    }

    setIsLoading(true)
    try {
      const url = buildReportUrl(clientId)
      const res = await api<ExpenseReport>(url, { auth: true })
      setReport(res || null)
    } catch (e: any) {
      setError(e?.message || "Não foi possível gerar o relatório.")
      setReport(null)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (v: number | undefined | null) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v ?? 0)

  const handleDownloadPdf = async () => {
    if (!report) return

    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    let y = 14

    doc.setFontSize(14)
    doc.text("Relatório de Despesas", 14, y)
    y += 8

    if (report.clientName) {
      doc.setFontSize(10)
      doc.text(`Cliente: ${report.clientName}`, 14, y)
      y += 6
    }
    if (report.clientEmail) {
      doc.text(`Email: ${report.clientEmail}`, 14, y)
      y += 6
    }

    if (report.startDate && report.endDate) {
      doc.text(`Período: ${report.startDate} a ${report.endDate}`, 14, y)
      y += 6
    }

    doc.text(`Total de despesas: ${report.totalExpenses ?? report.totalTransactions ?? 0}`, 14, y)
    y += 6
    doc.text(`Valor total: ${formatCurrency(report.totalAmount ?? 0)}`, 14, y)
    y += 8

    if (report.categorySummary && report.categorySummary.length > 0) {
      doc.setFontSize(11)
      doc.text("Resumo por categoria:", 14, y)
      y += 6
      doc.setFontSize(9)
      report.categorySummary.forEach((c) => {
        doc.text(
          `- ${c.category}: ${formatCurrency(c.total)} (${c.count} itens, ${c.percentage}%)`,
          16,
          y
        )
        y += 5
      })
      y += 3
    }

    if (report.expenses && report.expenses.length > 0) {
      doc.setFontSize(11)
      doc.text("Despesas:", 14, y)
      y += 6
      doc.setFontSize(8)
      report.expenses.forEach((exp) => {
        if (y > 270) {
          doc.addPage()
          y = 14
        }
        doc.text(
          `• ${exp.datePaid} - ${exp.description} - ${formatCurrency(exp.amount)} ${
            exp.category ? `(${exp.category})` : ""
          }`,
          14,
          y
        )
        y += 5
      })
    }

    doc.save("relatorio-despesas.pdf")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AppSidebar />

      <div className="flex-1 flex flex-col md:ml-60">
        <ProfileHeader showNotifications />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-0 py-6 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Relatórios · Despesas
              </p>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ReceiptText className="w-6 h-6 text-emerald-500" />
                Relatório de despesas
              </h1>
              <p className="text-sm text-slate-500">
                Gere um relatório completo por período e categoria.
              </p>
            </div>
            <button
              onClick={() => router.push("/expenses")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border text-sm text-slate-700 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para despesas
            </button>
          </div>

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
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gerar relatório"}
                </button>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">
                {error}
              </p>
            )}
          </div>

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
                <button
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600"
                >
                  <FileDown className="w-4 h-4" />
                  Baixar PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Total de despesas
                  </p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">
                    {report.totalExpenses ?? report.totalTransactions ?? 0}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Valor total do período
                  </p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">
                    {formatCurrency(report.totalAmount ?? 0)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Categoria filtrada
                  </p>
                  <p className="text-base font-medium text-slate-900 mt-1">
                    {category ? category : "Todas"}
                  </p>
                </div>
              </div>

              {report.categorySummary && report.categorySummary.length > 0 && (
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
                        {report.categorySummary.map((c) => (
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
                  Despesas do período
                </h3>
                {report.expenses && report.expenses.length > 0 ? (
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
                          <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                            Método
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {report.expenses.map((exp) => (
                          <tr key={exp.id}>
                            <td className="px-3 py-2">{exp.description}</td>
                            <td className="px-3 py-2">{formatCurrency(exp.amount)}</td>
                            <td className="px-3 py-2">{exp.datePaid}</td>
                            <td className="px-3 py-2">{exp.category || "—"}</td>
                            <td className="px-3 py-2">{exp.paymentMethod || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Nenhuma despesa retornada para os filtros informados.
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
