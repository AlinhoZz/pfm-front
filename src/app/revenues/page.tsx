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

type Revenue = {
  id: string
  description: string
  amount: number
  datePaid: string
  category?: string
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

export default function RevenuesPage() {
  const router = useRouter()

  const [clientId, setClientId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [revenues, setRevenues] = useState<Revenue[]>([])
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

  const toApiDate = (d: string) => {
    if (!d) return null
    const [dd, mm, yyyy] = d.split("/")
    if (!dd || !mm || !yyyy) return null
    return `${yyyy}-${mm}-${dd}`
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v ?? 0)

  const loadBase = async (cid: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const [revRes, catRes] = await Promise.allSettled([
        api<Revenue[]>(`/client/${cid}/revenues`, { auth: true }),
        api<Option[]>(`/api/categories/revenues`, { auth: true }),
      ])

      if (revRes.status === "fulfilled") {
        setRevenues(Array.isArray(revRes.value) ? revRes.value : [])
      } else {
        setError("Não foi possível carregar as receitas.")
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
      router.replace("/login")
      return
    }
    setClientId(cid)
    void loadBase(cid)
  }, [router])

  const handleFilter = async () => {
    if (!clientId) return

    const apiStart = toApiDate(startDate)
    const apiEnd = toApiDate(endDate)

    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError("Para filtrar por período, informe data inicial e final.")
      return
    }

    const params = new URLSearchParams()
    if (categoryFilter) params.set("category", categoryFilter)
    if (apiStart && apiEnd) {
      params.set("startDate", apiStart)
      params.set("endDate", apiEnd)
    }

    setIsLoading(true)
    setError(null)
    try {
      const url =
        params.toString().length > 0
          ? `/client/${clientId}/revenues?${params.toString()}`
          : `/client/${clientId}/revenues`
      const res = await api<Revenue[]>(url, { auth: true })
      setRevenues(Array.isArray(res) ? res : [])
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
    setNewError(null)
    setShowNew(true)
  }
  const closeNew = () => setShowNew(false)

  const handleSaveNew = async () => {
    if (!clientId) return
    setNewSaving(true)
    setNewError(null)
    try {
      if (!newCategory) {
        setNewError("Selecione uma categoria.")
        setNewSaving(false)
        return
      }
      const amountNumber = Number(newAmount.replace(/\./g, "").replace(",", "."))
      if (!amountNumber || amountNumber < 0.01) {
        setNewError("Informe um valor válido (mín. 0,01).")
        setNewSaving(false)
        return
      }

      const body = {
        description: newDescription || null,
        amount: amountNumber,
        datePaid: newDatePaid,
        category: newCategory,
      }

      await api(`/client/${clientId}/revenues`, {
        method: "POST",
        auth: true,
        body: JSON.stringify(body),
      })

      const list = await api<Revenue[]>(`/client/${clientId}/revenues`, { auth: true })
      setRevenues(Array.isArray(list) ? list : [])
      closeNew()
    } catch (e: any) {
      setNewError(e?.message || "Não foi possível salvar a receita.")
    } finally {
      setNewSaving(false)
    }
  }

  const openEdit = (rev: Revenue) => {
    setEditingId(rev.id)
    setEditDescription(rev.description || "")
    setEditAmount(typeof rev.amount === "number" ? rev.amount.toString().replace(".", ",") : "")
    setEditDatePaid(rev.datePaid || "")
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
      const current = revenues.find((r) => r.id === editingId)
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

      await api(`/revenues/${editingId}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(body),
      })

      if (clientId) {
        const list = await api<Revenue[]>(`/client/${clientId}/revenues`, { auth: true })
        setRevenues(Array.isArray(list) ? list : [])
      }
      closeEdit()
    } catch (e: any) {
      setEditError(e?.message || "Não foi possível salvar as alterações.")
    } finally {
      setEditSaving(false)
    }
  }

  const openDelete = (rev: Revenue) => {
    setDeleteId(rev.id)
    setDeleteDesc(rev.description || "")
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
      await api(`/revenues/${deleteId}`, { method: "DELETE", auth: true })
      if (clientId) {
        const list = await api<Revenue[]>(`/client/${clientId}/revenues`, { auth: true })
        setRevenues(Array.isArray(list) ? list : [])
      }
      closeDelete()
    } catch (e: any) {
      setDeleteError(e?.message || "Não foi possível excluir a receita.")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AppSidebar />

      <div className="flex-1 flex flex-col md:ml-60">
        <ProfileHeader showNotifications />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 lg:px-0 py-6 space-y-6">
          {/* Header / ações rápidas */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Entradas · Receitas
              </p>
              <h1 className="text-2xl font-bold text-slate-900">Receitas</h1>
              <p className="text-sm text-slate-500">
                Consulte, filtre e gerencie suas receitas.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border text-sm text-slate-700 hover:bg-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <button
                onClick={() => router.push("/reports/revenues")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border text-sm text-slate-700 hover:bg-white"
              >
                <FileText className="w-4 h-4" />
                Relatório
              </button>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm hover:bg-emerald-600"
              >
                <Plus className="w-4 h-4" />
                Nova receita
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 text-slate-600 text-sm">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Categoria</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
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
                  placeholder="dd/MM/yyyy"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Data final</label>
                <input
                  type="text"
                  placeholder="dd/MM/yyyy"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleFilter}
                  className="w-full h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Filtrar
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-700 rounded p-2 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Lista mobile */}
          <div className="md:hidden grid gap-3">
            {isLoading ? (
              <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando receitas...
              </div>
            ) : revenues.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 p-4 text-slate-400 text-sm">
                Nenhuma receita encontrada.
              </div>
            ) : (
              revenues.map((rev) => (
                <div key={rev.id} className="bg-white rounded-xl border border-slate-100 p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {rev.description || "—"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {rev.datePaid || "—"} {rev.category ? `• ${rev.category}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(rev.amount)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(rev)}
                      className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDelete(rev)}
                      className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Tabela desktop */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Descrição
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Carregando receitas...
                        </span>
                      </td>
                    </tr>
                  ) : revenues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        Nenhuma receita encontrada.
                      </td>
                    </tr>
                  ) : (
                    revenues.map((rev) => (
                      <tr key={rev.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-900">
                          {rev.description || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-900">
                          {formatCurrency(rev.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                          {rev.datePaid || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                          {rev.category || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEdit(rev)}
                              className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDelete(rev)}
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

      {/* Modal Nova receita */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeNew}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Nova receita</h2>

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
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
                  placeholder="ex.: Salário"
                  maxLength={255}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
                <input
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Data de recebimento
                </label>
                <input
                  value={newDatePaid}
                  onChange={(e) => setNewDatePaid(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
                  placeholder="dd/MM/yyyy"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
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
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeNew}
                className="px-4 h-9 rounded bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNew}
                disabled={newSaving}
                className="px-4 h-9 rounded bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:opacity-70"
              >
                {newSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar receita */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeEdit}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Editar receita</h2>

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
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
                <input
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Data de recebimento
                </label>
                <input
                  value={editDatePaid}
                  onChange={(e) => setEditDatePaid(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
                  placeholder="dd/MM/yyyy"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeEdit}
                className="px-4 h-9 rounded bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="px-4 h-9 rounded bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:opacity-70"
              >
                {editSaving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir receita */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button
              onClick={closeDelete}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Excluir receita</h2>
            <p className="text-sm text-slate-600 mb-4">
              Tem certeza que deseja excluir{" "}
              {deleteDesc ? (
                <span className="font-semibold text-slate-900">“{deleteDesc}”</span>
              ) : (
                "esta receita?"
              )}
            </p>

            {deleteError && (
              <div className="mb-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={closeDelete}
                className="px-4 h-9 rounded bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 h-9 rounded bg-rose-500 text-white text-sm hover:bg-rose-600 disabled:opacity-70"
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
