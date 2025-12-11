"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProfileHeader from "@/components/profile-header"
import { AppSidebar } from "@/components/app-sidebar"
import { api } from "@/lib/api"
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Target,
  Loader2,
  X,
} from "lucide-react"

type Goal = {
  id: string
  description: string
  targetAmount: number
  targetDate: string // dd/MM/yyyy ou yyyy-MM-dd
  dateCreated?: string
  accumulated?: number
  progress?: number
}

export default function GoalsPage() {
  const router = useRouter()

  const [clientId, setClientId] = useState<string | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // NOVA META
  const [showNew, setShowNew] = useState(false)
  const [newDescription, setNewDescription] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newSaving, setNewSaving] = useState(false)
  const [newError, setNewError] = useState<string | null>(null)

  // EDITAR META
  const [showEdit, setShowEdit] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editOriginal, setEditOriginal] = useState<Goal | null>(null)

  // EXCLUIR META
  const [showDelete, setShowDelete] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteDesc, setDeleteDesc] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // *** NOVO: CONTRIBUIR META ***
  const [showContrib, setShowContrib] = useState(false)
  const [contribId, setContribId] = useState<string | null>(null)
  const [contribDesc, setContribDesc] = useState("")
  const [contribAmount, setContribAmount] = useState("")
  const [contribSaving, setContribSaving] = useState(false)
  const [contribError, setContribError] = useState<string | null>(null)

  function ensureDDMMYYYY(d: string) {
    if (!d) return ""
    if (d.includes("/")) return d
    if (d.includes("-")) {
      const [yyyy, mm, dd] = d.split("-")
      return `${dd}/${mm}/${yyyy}`
    }
    return d
  }

  const formatCurrency = (v: number | undefined | null) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v ?? 0)

  const loadGoals = async (cid: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api<Goal[]>(`/clients/${cid}/goals`, { auth: true })
      setGoals(Array.isArray(res) ? res : [])
    } catch {
      setError("Não foi possível carregar as metas.")
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
    void loadGoals(cid)
  }, [router])

  // --------- NOVA META ----------
  const openNew = () => {
    setNewDescription("")
    setNewAmount("")
    setNewDate("")
    setNewError(null)
    setShowNew(true)
  }
  const closeNew = () => setShowNew(false)

  const handleSaveNew = async () => {
    if (!clientId) return
    setNewSaving(true)
    setNewError(null)

    if (!newDescription || newDescription.trim().length < 3) {
      setNewError("Descrição precisa ter no mínimo 3 caracteres.")
      setNewSaving(false)
      return
    }
    if (!/^[A-Za-zÀ-ú\s]+$/.test(newDescription.trim())) {
      setNewError("Descrição deve conter apenas letras.")
      setNewSaving(false)
      return
    }
    if (!newAmount) {
      setNewError("Informe o valor-alvo.")
      setNewSaving(false)
      return
    }
    if (!newDate) {
      setNewError("Informe a data-alvo.")
      setNewSaving(false)
      return
    }

    const amountNumber = Number(newAmount.replace(/\./g, "").replace(",", "."))
    if (!Number.isFinite(amountNumber) || amountNumber < 0.01) {
      setNewError("Valor-alvo inválido.")
      setNewSaving(false)
      return
    }

    const body = {
      description: newDescription.trim(),
      targetAmount: amountNumber,
      targetDate: ensureDDMMYYYY(newDate),
    }

    try {
      await api(`/clients/${clientId}/goals`, {
        method: "POST",
        auth: true,
        body: JSON.stringify(body),
      })

      await loadGoals(clientId)
      closeNew()
    } catch (e: any) {
      setNewError(e?.message || "Erro ao criar meta.")
    } finally {
      setNewSaving(false)
    }
  }

  // --------- EDITAR META ----------
  const openEdit = (goal: Goal) => {
    setEditId(goal.id)
    setEditOriginal(goal)
    setEditDescription(goal.description || "")
    setEditAmount(
      typeof goal.targetAmount === "number"
        ? goal.targetAmount.toString().replace(".", ",")
        : "",
    )
    if (goal.targetDate && goal.targetDate.includes("-")) {
      const [yyyy, mm, dd] = goal.targetDate.split("-")
      setEditDate(`${dd}/${mm}/${yyyy}`)
    } else {
      setEditDate(goal.targetDate || "")
    }
    setEditError(null)
    setShowEdit(true)
  }

  const closeEdit = () => {
    setShowEdit(false)
    setEditId(null)
    setEditOriginal(null)
  }

  const handleSaveEdit = async () => {
    if (!editId) return
    setEditSaving(true)
    setEditError(null)

    if (!editDescription || editDescription.trim().length < 3) {
      setEditError("Descrição precisa ter no mínimo 3 caracteres.")
      setEditSaving(false)
      return
    }
    if (!/^[A-Za-zÀ-ú\s]+$/.test(editDescription.trim())) {
      setEditError("Descrição deve conter apenas letras.")
      setEditSaving(false)
      return
    }
    if (!editAmount) {
      setEditError("Informe o valor-alvo.")
      setEditSaving(false)
      return
    }
    if (!editDate) {
      setEditError("Informe a data-alvo.")
      setEditSaving(false)
      return
    }

    const amountNumber = Number(editAmount.replace(/\./g, "").replace(",", "."))
    if (!Number.isFinite(amountNumber) || amountNumber < 0.01) {
      setEditError("Valor-alvo inválido.")
      setEditSaving(false)
      return
    }

    const body: Record<string, any> = {}
    const original = editOriginal

    const newDesc = editDescription.trim()
    const newDate = ensureDDMMYYYY(editDate)

    if (!original || original.description !== newDesc) {
      body.description = newDesc
    }
    if (!original || original.targetAmount !== amountNumber) {
      body.targetAmount = amountNumber
    }
    if (!original || ensureDDMMYYYY(original.targetDate) !== newDate) {
      body.targetDate = newDate
    }

    if (Object.keys(body).length === 0) {
      setEditError("Nenhuma alteração detectada.")
      setEditSaving(false)
      return
    }

    try {
      await api(`/goals/${editId}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(body),
      })

      if (clientId) {
        await loadGoals(clientId)
      }
      closeEdit()
    } catch (e: any) {
      setEditError(e?.message || "Não foi possível salvar a meta.")
    } finally {
      setEditSaving(false)
    }
  }

  // --------- EXCLUIR META ----------
  const openDelete = (goal: Goal) => {
    setDeleteId(goal.id)
    setDeleteDesc(goal.description || "")
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
      await api(`/goals/${deleteId}`, {
        method: "DELETE",
        auth: true,
      })

      if (clientId) {
        await loadGoals(clientId)
      }
      closeDelete()
    } catch (e: any) {
      setDeleteError(e?.message || "Não foi possível excluir a meta.")
    } finally {
      setDeleteLoading(false)
    }
  }

  // --------- *** CONTRIBUIR META *** ----------
  const openContrib = (goal: Goal) => {
    setContribId(goal.id)
    setContribDesc(goal.description || "")
    setContribAmount("")
    setContribError(null)
    setShowContrib(true)
  }

  const closeContrib = () => {
    setShowContrib(false)
    setContribId(null)
    setContribDesc("")
    setContribAmount("")
  }

  const handleSaveContrib = async () => {
    if (!contribId) return
    setContribSaving(true)
    setContribError(null)

    if (!contribAmount) {
      setContribError("Informe um valor para contribuir.")
      setContribSaving(false)
      return
    }

    const amountNumber = Number(contribAmount.replace(/\./g, "").replace(",", "."))
    if (!Number.isFinite(amountNumber) || amountNumber < 0.01) {
      setContribError("Valor de contribuição inválido (mín. 0,01).")
      setContribSaving(false)
      return
    }

    try {
      await api(`/goals/${contribId}/contribute`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({ amount: amountNumber }),
      })

      if (clientId) {
        await loadGoals(clientId)
      }
      closeContrib()
    } catch (e: any) {
      setContribError(e?.message || "Não foi possível registrar a contribuição.")
    } finally {
      setContribSaving(false)
    }
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
                Planejamento · Metas
              </p>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-emerald-500" />
                Metas
              </h1>
              <p className="text-sm text-slate-500">
                Gerencie seus objetivos financeiros e prazos.
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
                onClick={openNew}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm hover:bg-emerald-600"
              >
                <Plus className="w-4 h-4" />
                Nova meta
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando metas...
              </div>
            ) : goals.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center">
                <p className="text-slate-500 mb-3">Nenhuma meta cadastrada.</p>
                <button
                  onClick={openNew}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm hover:bg-emerald-600"
                >
                  <Plus className="w-4 h-4" />
                  Criar primeira meta
                </button>
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col justify-between shadow-sm"
                >
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                      Meta
                    </p>
                    <h2 className="text-base font-semibold text-slate-900 break-words">
                      {goal.description}
                    </h2>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <p>
                      Valor alvo:{" "}
                      <span className="font-medium text-slate-900">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Prazo:{" "}
                      <span className="font-medium text-slate-900">
                        {ensureDDMMYYYY(goal.targetDate) || "—"}
                      </span>
                    </p>
                    {typeof goal.accumulated === "number" && (
                      <p>
                        Já acumulado:{" "}
                        <span className="font-medium text-slate-900">
                          {formatCurrency(goal.accumulated)}
                        </span>
                      </p>
                    )}
                    {typeof goal.progress === "number" && (
                      <p className="text-xs text-emerald-600">
                        Progresso: {goal.progress.toFixed(1)}%
                      </p>
                    )}
                    {goal.dateCreated && (
                      <p className="text-[11px] text-slate-400">
                        Criada em: {goal.dateCreated}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openContrib(goal)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm hover:bg-emerald-100"
                    >
                      <Plus className="w-4 h-4" />
                      Contribuir
                    </button>
                    <button
                      onClick={() => openEdit(goal)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-sm hover:bg-slate-100"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => openDelete(goal)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-sm hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Modal Nova meta */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeNew}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Nova meta</h2>

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
                  placeholder="ex: Viagem"
                  maxLength={255}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Valor alvo (R$)</label>
                <input
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Data alvo <span className="text-slate-400">(dd/MM/yyyy)</span>
                </label>
                <input
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
                  placeholder="31/12/2025"
                />
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

      {/* Modal Editar meta */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeEdit}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Editar meta</h2>

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
                <label className="text-sm font-medium text-slate-700">Valor alvo (R$)</label>
                <input
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Data alvo <span className="text-slate-400">(dd/MM/yyyy)</span>
                </label>
                <input
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
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

      {/* Modal Excluir meta */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button
              onClick={closeDelete}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Excluir meta</h2>
            <p className="text-sm text-slate-600 mb-4">
              Tem certeza que deseja excluir{" "}
              {deleteDesc ? (
                <span className="font-semibold text-slate-900">“{deleteDesc}”</span>
              ) : (
                "esta meta?"
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

      {/* Modal Contribuir meta */}
      {showContrib && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeContrib}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Contribuir para meta
            </h2>
            {contribDesc && (
              <p className="text-sm text-slate-500 mb-4 break-words">
                Meta: <span className="font-medium text-slate-900">{contribDesc}</span>
              </p>
            )}

            {contribError && (
              <div className="mb-3 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">
                {contribError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Valor da contribuição (R$)
                </label>
                <input
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="mt-1 w-full h-9 border border-slate-200 rounded px-3 text-sm"
                  placeholder="ex.: 100,00"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeContrib}
                className="px-4 h-9 rounded bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveContrib}
                disabled={contribSaving}
                className="px-4 h-9 rounded bg-emerald-500 text-white text-sm hover:bg-emerald-600 disabled:opacity-70"
              >
                {contribSaving ? "Registrando..." : "Contribuir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
