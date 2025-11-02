"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import ProfileHeader from "@/components/profile-header"
import { AppSidebar } from "@/components/app-sidebar"
import {
  ArrowRight,
  Wallet,
  TrendingDown,
  Target,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
} from "lucide-react"
import { api } from "@/lib/api"

type FinanceInfos = {
  id?: string
  income: number
  netWorth: number
  profission?: string
}

type Expense = {
  id: string
  description: string
  datePaid: string
  amount: number
}

type Revenue = {
  id: string
  description: string
  datePaid: string
  amount: number
  category?: string
}

type Goal = {
  id: string
  name?: string
  description?: string
  status?: string
}

export default function DashboardPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [financeInfos, setFinanceInfos] = useState<FinanceInfos | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const lsToken = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const lsClientId = typeof window !== "undefined" ? localStorage.getItem("clientId") : null

    if (!lsToken || !lsClientId) {
      router.replace("/auth/login")
      return
    }

    ;(async () => {
      setIsLoading(true)
      setError(null)

      const [financeRes, expensesRes, revenuesRes, goalsRes] = await Promise.allSettled([
        api<FinanceInfos>(`/clients/${lsClientId}/finance-infos`, { auth: true }),
        api<any[]>(`/client/${lsClientId}/expenses`, { auth: true }),
        api<any[]>(`/client/${lsClientId}/revenues`, { auth: true }),
        api<Goal[]>(`/clients/${lsClientId}/goals`, { auth: true }),
      ])

      if (financeRes.status === "fulfilled") {
        setFinanceInfos(financeRes.value ?? null)
      } else {
        const msg = String(financeRes.reason || "")
        const isAllowed =
          msg.includes("HTTP 403") ||
          msg.includes("HTTP 404") ||
          msg.includes("não encontradas")
        if (!isAllowed) {
          setError("Não foi possível carregar as informações financeiras.")
        }
      }

      if (expensesRes.status === "fulfilled") {
        const arr = Array.isArray(expensesRes.value) ? expensesRes.value : []
        const last5: Expense[] = arr.slice(0, 5).map((e: any) => ({
          id: e.id,
          description: e.description,
          datePaid: e.datePaid,
          amount: e.amount,
        }))
        setExpenses(last5)
      } else {
        setError("Não foi possível carregar as despesas.")
      }

      if (revenuesRes.status === "fulfilled") {
        const arr = Array.isArray(revenuesRes.value) ? revenuesRes.value : []
        const last5: Revenue[] = arr.slice(0, 5).map((r: any) => ({
          id: r.id,
          description: r.description,
          datePaid: r.datePaid,
          amount: r.amount,
          category: r.category,
        }))
        setRevenues(last5)
      } else {
        setError("Não foi possível carregar as receitas.")
      }

      if (goalsRes.status === "fulfilled") {
        setGoals(Array.isArray(goalsRes.value) ? goalsRes.value : [])
      } else {
        setError("Não foi possível carregar as metas.")
      }

      setIsLoading(false)
    })()
  }, [router])

  const formatCurrency = (value: number | undefined | null) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2,
    }).format(value ?? 0)

  const totalLastExpenses = useMemo(
    () => expenses.reduce((acc, cur) => acc + (cur.amount || 0), 0),
    [expenses],
  )
  const totalLastRevenues = useMemo(
    () => revenues.reduce((acc, cur) => acc + (cur.amount || 0), 0),
    [revenues],
  )
  const netShort = useMemo(
    () => (totalLastRevenues || 0) - (totalLastExpenses || 0),
    [totalLastExpenses, totalLastRevenues],
  )

  return (
    <div className="min-h-screen bg-white flex">
      <AppSidebar />

      <div className="flex-1 md:ml-60 flex flex-col">
        <ProfileHeader showNotifications />

        {/* hero */}
        <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white">
          <div className="max-w-6xl mx-auto w-full px-4 lg:px-0 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-700/40 rounded-full text-xs font-medium mb-3">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString("pt-BR")}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold">Visão geral financeira</h1>
              <p className="text-sm md:text-base text-emerald-50 mt-2 max-w-xl">
                Acompanhe rapidamente patrimônio, movimentações recentes e o progresso das suas metas.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push("/expenses")}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/30 rounded-full text-sm hover:bg-white/20 transition"
              >
                Despesas
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push("/revenues")}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/30 rounded-full text-sm hover:bg-white/20 transition"
              >
                Receitas
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push("/goals")}
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm text-emerald-700 hover:bg-slate-50 transition"
              >
                Metas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-0 py-6 space-y-6">
          {/* cards principais */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 p-4 flex gap-3 items-center shadow-sm">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Patrimônio líquido
                </p>
                <p className="text-xl font-semibold text-slate-900 truncate">
                  {isLoading ? "..." : formatCurrency(financeInfos?.netWorth)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Saldo atual informado</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-4 flex gap-3 items-center shadow-sm">
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Receitas recentes (5)
                </p>
                <p className="text-xl font-semibold text-slate-900 truncate">
                  {isLoading ? "..." : formatCurrency(totalLastRevenues)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Últimas entradas registradas</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-4 flex gap-3 items-center shadow-sm">
              <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Despesas recentes (5)
                </p>
                <p className="text-xl font-semibold text-slate-900 truncate">
                  {isLoading ? "..." : formatCurrency(totalLastExpenses)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Últimos pagamentos</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-4 flex gap-3 items-center shadow-sm">
              <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-slate-500">Metas ativas</p>
                <p className="text-xl font-semibold text-slate-900 truncate">
                  {isLoading ? "..." : goals.length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {goals.length > 0 ? "Acompanhe o progresso" : "Nenhuma meta cadastrada"}
                </p>
              </div>
            </div>
          </section>

          {/* infos financeiras detalhadas VOLTOU AQUI */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Renda mensal informada
              </p>
              <p className="text-2xl font-semibold text-slate-900">
                {isLoading ? "..." : formatCurrency(financeInfos?.income)}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Último cadastro em informações financeiras
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Profissão</p>
              <p className="text-base font-medium text-slate-900">
                {financeInfos?.profission ? financeInfos.profission : "—"}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Informações do seu cadastro principal
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Ações rápidas
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => router.push("/finance-info")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs hover:bg-emerald-600"
                >
                  Editar informações
                </button>
                <button
                  onClick={() => router.push("/reports/expenses")}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200"
                >
                  Relatório de despesas
                </button>
              </div>
            </div>
          </section>

          {/* resumo + listas */}
          <section className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Resumo rápido</p>
                <p className="text-base font-semibold text-slate-900">
                  {netShort >= 0
                    ? `Você está positivo em ${formatCurrency(netShort)} nas últimas entradas/saídas.`
                    : `Atenção: você está negativo em ${formatCurrency(Math.abs(netShort))}.`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => router.push("/reports/expenses")}
                className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
              >
                Relatório de despesas
              </button>
              <button
                onClick={() => router.push("/reports/revenues")}
                className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm hover:bg-emerald-600"
              >
                Relatório de receitas
              </button>
            </div>
          </section>

          {/* colunas principais */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
            {/* receitas */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Últimas receitas</h2>
                  <p className="text-xs text-slate-400">
                    Entradas mais recentes registradas no sistema
                  </p>
                </div>
                <button
                  onClick={() => router.push("/revenues")}
                  className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Ver todas <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <ul className="divide-y divide-slate-100">
                {isLoading ? (
                  <li className="p-4 text-sm text-slate-400">Carregando receitas...</li>
                ) : revenues.length === 0 ? (
                  <li className="p-4 text-sm text-slate-400">Nenhuma receita encontrada.</li>
                ) : (
                  revenues.map((rev) => (
                    <li key={rev.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {rev.description || "Receita"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {rev.datePaid} {rev.category ? `• ${rev.category}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-600 shrink-0">
                        {formatCurrency(rev.amount)}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* despesas */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Últimas despesas</h2>
                  <p className="text-xs text-slate-400">Pagamentos e saídas mais recentes</p>
                </div>
                <button
                  onClick={() => router.push("/expenses")}
                  className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Ver todas <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <ul className="divide-y divide-slate-100">
                {isLoading ? (
                  <li className="p-4 text-sm text-slate-400">Carregando despesas...</li>
                ) : expenses.length === 0 ? (
                  <li className="p-4 text-sm text-slate-400">Nenhuma despesa encontrada.</li>
                ) : (
                  expenses.map((exp) => (
                    <li key={exp.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {exp.description || "Despesa"}
                        </p>
                        <p className="text-xs text-slate-400">{exp.datePaid}</p>
                      </div>
                      <p className="text-sm font-semibold text-rose-500 shrink-0">
                        -{formatCurrency(exp.amount)}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>

          {/* mobile quick actions */}
          <div className="md:hidden grid grid-cols-2 gap-3 pb-6">
            <button
              onClick={() => router.push("/expenses")}
              className="bg-white rounded-lg border border-slate-100 py-2 text-sm font-medium text-slate-700 flex items-center justify-center gap-1"
            >
              Despesas <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/revenues")}
              className="bg-white rounded-lg border border-slate-100 py-2 text-sm font-medium text-slate-700 flex items-center justify-center gap-1"
            >
              Receitas <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/goals")}
              className="bg-white rounded-lg border border-slate-100 py-2 text-sm font-medium text-slate-700 flex items-center justify-center gap-1"
            >
              Metas <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/finance-info")}
              className="bg-emerald-500 rounded-lg py-2 text-sm font-medium text-white flex items-center justify-center gap-1"
            >
              Financeiro <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
