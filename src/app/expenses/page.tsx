"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProfileHeader from "@/components/profile-header"
import { AppSidebar } from "@/components/app-sidebar"
import { api } from "@/lib/api"
import {
  Plus,
  ArrowLeft,
  FileText,
  Trash2,
  Pencil,
  Filter,
  Loader2,
  X,
} from "lucide-react"

type Expense = {
  id: string
  description: string
  amount: number
  datePaid: string
  category?: string
  paymentMethod?: string
  payer?: string
}

type Option =
  | {
      id?: string
      name?: string
      code?: string
      value?: string
      label?: string
    }
  | string

const PAYMENT_ENUMS = [
  "DINHEIRO",
  "CHEQUE",
  "DEBITO",
  "CREDITO_VISTA",
  "OUTROS",
  "CRIPTOMOEDA",
  "VALE_ALIMENTACAO",
  "TRANSFERENCIA_BANCARIA",
  "CREDITO_PARCELADO",
  "PIX",
  "DEBITO_AUTOMATICO",
  "VALE_REFEICAO",
  "BOLETO",
] as const

const PAYMENT_LABELS: Record<(typeof PAYMENT_ENUMS)[number], string> = {
  DINHEIRO: "Dinheiro",
  CHEQUE: "Cheque",
  DEBITO: "Débito",
  CREDITO_VISTA: "Crédito à vista",
  OUTROS: "Outros",
  CRIPTOMOEDA: "Criptomoeda",
  VALE_ALIMENTACAO: "Vale alimentação",
  TRANSFERENCIA_BANCARIA: "Transferência bancária",
  CREDITO_PARCELADO: "Crédito parcelado",
  PIX: "PIX",
  DEBITO_AUTOMATICO: "Débito automático",
  VALE_REFEICAO: "Vale refeição",
  BOLETO: "Boleto",
}

function toApiDate(d: string) {
  if (!d) return null
  const [dia, mes, ano] = d.split("/")
  if (!dia || !mes || !ano) return null
  return `${ano}-${mes}-${dia}`
}

export default function ExpensesPage() {
  const router = useRouter()

  const [clientId, setClientId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [error, setError] = useState<string | null>(null)

  const [categoryFilter, setCategoryFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [showNew, setShowNew] = useState(false)
  const [newDescription, setNewDescription] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newDatePaid, setNewDatePaid] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newPaymentMethod, setNewPaymentMethod] = useState("")
  const [newPayer, setNewPayer] = useState("")
  const [newSaving, setNewSaving] = useState(false)
  const [newError, setNewError] = useState<string | null>(null)

  const [showEdit, setShowEdit] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editDatePaid, setEditDatePaid] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [showDelete, setShowDelete] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteDesc, setDeleteDesc] = useState<string>("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const normalizeOption = (opt: Option) => {
    if (typeof opt === "string") return { value: opt, label: opt }
    return {
      value: opt.code || opt.id || opt.value || opt.name || "",
      label: opt.name || opt.label || opt.code || opt.value || "",
    }
  }

  const loadBaseData = async (cid: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const [expRes, catRes] = await Promise.allSettled([
        api<Expense[]>(`/client/${cid}/expenses`, { auth: true }),
        api<Option[]>(`/api/categories/expenses`, { auth: true }),
      ])

      if (expRes.status === "fulfilled") {
        setExpenses(Array.isArray(expRes.value) ? expRes.value : [])
      } else {
        setError("Não foi possível carregar as despesas.")
      }

      if (catRes.status === "fulfilled") {
        setCategories(Array.isArray(catRes.value) ? catRes.value : [])
      }
    } catch {
      setError("Erro ao carregar dados.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const cid = typeof window !== "undefined" ? localStorage.getItem("clientId") : null
    if (!token || !cid) {
      router.replace("/auth/login")
      return
    }
    setClientId(cid)
    void loadBaseData(cid)
  }, [router])

  const handleFilter = async () => {
    if (!clientId) return

    const apiStart = toApiDate(startDate)
    const apiEnd = toApiDate(endDate)

    const params = new URLSearchParams()
    if (categoryFilter) params.set("category", categoryFilter)
    if (apiStart && apiEnd) {
      params.set("startDate", apiStart)
      params.set("endDate", apiEnd)
    } else if ((startDate && !endDate) || (!startDate && endDate)) {
      setError("Para filtrar por data, informe data inicial e final.")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const url =
        params.toString().length > 0
          ? `/client/${clientId}/expenses?${params.toString()}`
          : `/client/${clientId}/expenses`
      const res = await api<Expense[]>(url, { auth: true })
      setExpenses(Array.isArray(res) ? res : [])
    } catch {
      setError("Não foi possível aplicar o filtro.")
    } finally {
      setIsLoading(false)
    }
  }

  const openNew = () => {
    setNewDescription("")
    setNewAmount("")
    setNewDatePaid("")
    setNewCategory("")
    setNewPaymentMethod("")
    setNewPayer("")
    setNewError(null)
    setShowNew(true)
  }

  const closeNew = () => setShowNew(false)

  const handleSaveNew = async () => {
    if (!clientId) return
    setNewSaving(true)
    setNewError(null)
    try {
      const amountNumber =
        newAmount.trim() === ""
          ? 0
          : Number(newAmount.replace(/\./g, "").replace(",", "."))

      const pm = newPaymentMethod.trim()
      if (pm && !PAYMENT_ENUMS.includes(pm as any)) {
        setNewError("Método de pagamento inválido para o servidor.")
        setNewSaving(false)
        return
      }

      const body = {
        description: newDescription || null,
        amount: amountNumber,
        datePaid: newDatePaid,
        category: newCategory || null,
        paymentMethod: pm || null,
        payer: newPayer || null,
      }

      await api(`/client/${clientId}/expenses`, {
        method: "POST",
        auth: true,
        body: JSON.stringify(body),
      })

      const list = await api<Expense[]>(`/client/${clientId}/expenses`, { auth: true })
      setExpenses(Array.isArray(list) ? list : [])

      closeNew()
    } catch (e: any) {
      setNewError(e?.message || "Erro ao salvar despesa.")
    } finally {
      setNewSaving(false)
    }
  }

  const openEdit = (exp: Expense) => {
    setEditingId(exp.id)
    setEditDescription(exp.description || "")
    setEditAmount(typeof exp.amount === "number" ? String(exp.amount).replace(".", ",") : "")
    setEditDatePaid(exp.datePaid || "")
    setEditError(null)
    setShowEdit(true)
  }

  const closeEdit = () => {
    setShowEdit(false)
    setEditingId(null)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setEditSaving(true)
    setEditError(null)
    try {
      const current = expenses.find((e) => e.id === editingId)

      const amountNumber =
        editAmount.trim() === ""
          ? undefined
          : Number(editAmount.replace(/\./g, "").replace(",", "."))

      const body: any = {}

      if ((current?.description || "") !== editDescription) {
        body.description = editDescription || ""
      }
      if ((current?.datePaid || "") !== editDatePaid) {
        body.datePaid = editDatePaid
      }
      if (
        typeof amountNumber === "number" &&
        Number.isFinite(amountNumber) &&
        current?.amount !== amountNumber
      ) {
        body.amount = amountNumber
      }

      if (Object.keys(body).length === 0) {
        setEditError("Nenhuma alteração detectada.")
        setEditSaving(false)
        return
      }

      await api(`/expenses/${editingId}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(body),
      })

      if (clientId) {
        const list = await api<Expense[]>(`/client/${clientId}/expenses`, { auth: true })
        setExpenses(Array.isArray(list) ? list : [])
      }

      closeEdit()
    } catch (e: any) {
      setEditError(e?.message || "Erro ao salvar alterações.")
    } finally {
      setEditSaving(false)
    }
  }

  const openDelete = (exp: Expense) => {
    setDeleteId(exp.id)
    setDeleteDesc(exp.description || "")
    setDeleteError(null)
    setShowDelete(true)
  }

  const closeDelete = () => {
    setShowDelete(false)
    setDeleteId(null)
    setDeleteDesc("")
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await api(`/expenses/${deleteId}`, {
        method: "DELETE",
        auth: true,
      })

      if (clientId) {
        const list = await api<Expense[]>(`/client/${clientId}/expenses`, { auth: true })
        setExpenses(Array.isArray(list) ? list : [])
      }
      closeDelete()
    } catch (e: any) {
      setDeleteError(e?.message || "Não foi possível excluir a despesa.")
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v ?? 0)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AppSidebar />

      <div className="flex-1 flex flex-col md:ml-60">
        <ProfileHeader showNotifications />

        <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-0 py-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Financeiro · Despesas
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                Despesas
                {!isLoading && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900/5 text-xs text-slate-500">
                    {expenses.length} registros
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-500">
                Consulte, filtre e gerencie todas as despesas do cliente.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/60 border border-slate-200 text-sm text-slate-700 hover:bg-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <button
                onClick={() => router.push("/reports/expenses")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/60 border border-slate-200 text-sm text-slate-700 hover:bg-white"
              >
                <FileText className="w-4 h-4" />
                Relatório
              </button>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm hover:bg-emerald-600 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nova despesa
              </button>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-slate-600 text-sm">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Categoria</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 bg-white"
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
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Data inicial</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="dd/MM/yyyy"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Data final</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="dd/MM/yyyy"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleFilter}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Aplicar filtro
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-3 md:hidden">
            {isLoading ? (
              <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando despesas...
              </div>
            ) : expenses.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-4 text-slate-400 text-sm">
                Nenhuma despesa encontrada.
              </div>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {exp.description || "—"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {exp.datePaid || "—"} {exp.category ? `• ${exp.category}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(exp.amount)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      {exp.paymentMethod
                        ? PAYMENT_LABELS[exp.paymentMethod as (typeof PAYMENT_ENUMS)[number]] ||
                          exp.paymentMethod
                        : "—"}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(exp)}
                        className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDelete(exp)}
                        className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden hidden md:block shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Descrição
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Data de pagamento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Método
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Pagador
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-slate-400 text-sm">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Carregando despesas...
                        </span>
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-slate-400 text-sm">
                        Nenhuma despesa encontrada.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-900">
                          {exp.description || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-900">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                          {exp.datePaid || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                          {exp.category || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                          {exp.paymentMethod
                            ? PAYMENT_LABELS[exp.paymentMethod as (typeof PAYMENT_ENUMS)[number]] ||
                              exp.paymentMethod
                            : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                          {exp.payer || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEdit(exp)}
                              className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDelete(exp)}
                              className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={closeNew}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Nova despesa</h2>
            <p className="text-xs text-slate-500 mb-4">
              Preencha os campos para registrar uma nova despesa.
            </p>

            {newError && (
              <div className="mb-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">
                {newError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Descrição</label>
                <input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  maxLength={255}
                  placeholder="ex: Conta de energia"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
                  <input
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                    placeholder="0,00"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700">Data de pagamento</label>
                  <input
                    value={newDatePaid}
                    onChange={(e) => setNewDatePaid(e.target.value)}
                    className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                    placeholder="dd/MM/yyyy"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  >
                    <option value="">Selecione...</option>
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
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700">Método</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  >
                    <option value="">Selecione...</option>
                    {PAYMENT_ENUMS.map((code) => (
                      <option key={code} value={code}>
                        {PAYMENT_LABELS[code]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Pagador</label>
                <input
                  value={newPayer}
                  onChange={(e) => setNewPayer(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  placeholder="Nome do pagador"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={closeNew}
                className="px-4 h-9 rounded bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNew}
                disabled={newSaving}
                className="px-4 h-9 rounded bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:opacity-70 w-full sm:w-auto"
              >
                {newSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={closeEdit}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Editar despesa</h2>
            <p className="text-xs text-slate-500 mb-4">
              Altere somente os campos que realmente mudaram.
            </p>

            {editError && (
              <div className="mb-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">
                {editError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Descrição</label>
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
                <input
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Data de pagamento</label>
                <input
                  value={editDatePaid}
                  onChange={(e) => setEditDatePaid(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                  placeholder="dd/MM/yyyy"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={closeEdit}
                className="px-4 h-9 rounded bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="px-4 h-9 rounded bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:opacity-70 w-full sm:w-auto"
              >
                {editSaving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={closeDelete}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Excluir despesa</h2>
            <p className="text-sm text-slate-600 mb-4">
              Tem certeza que deseja excluir
              {deleteDesc ? (
                <>
                  {" "}
                  <span className="font-semibold text-slate-900">“{deleteDesc}”</span>?
                </>
              ) : (
                " esta despesa?"
              )}
            </p>

            {deleteError && (
              <div className="mb-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">
                {deleteError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={closeDelete}
                className="px-4 h-9 rounded bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 h-9 rounded bg-rose-500 text-white text-sm hover:bg-rose-600 disabled:opacity-70 w-full sm:w-auto"
              >
                {deleteLoading ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
