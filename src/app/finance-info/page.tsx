"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProfileHeader from "@/components/profile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { Wallet, Briefcase, PiggyBank } from "lucide-react"

type FinanceInfo = {
  id: string
  income: number
  profission: string
  netWorth: number
}

export default function FinanceInfoPage() {
  const router = useRouter()
  const { success, error } = useToast()

  const [clientId, setClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [recordId, setRecordId] = useState<string | null>(null)
  const [savedIncome, setSavedIncome] = useState("0,00")
  const [savedProfission, setSavedProfission] = useState("")
  const [savedNetWorth, setSavedNetWorth] = useState("0,00")

  const [open, setOpen] = useState(false)
  const [income, setIncome] = useState("")
  const [profission, setProfission] = useState("")
  const [netWorth, setNetWorth] = useState("")

  useEffect(() => {
    const lsClientId = typeof window !== "undefined" ? localStorage.getItem("clientId") : null
    const lsToken = typeof window !== "undefined" ? localStorage.getItem("token") : null

    if (!lsClientId || !lsToken) {
      router.replace("/auth/login")
      return
    }

    setClientId(lsClientId)

      ; (async () => {
        setLoading(true)
        try {
          const data = await api<FinanceInfo>(`/clients/${lsClientId}/finance-infos`, {
            method: "GET",
            auth: true,
          })

          if (data?.id) {
            setRecordId(data.id)
            setSavedIncome(Number(data.income ?? 0).toFixed(2))
            setSavedProfission(data.profission ?? "")
            setSavedNetWorth(Number(data.netWorth ?? 0).toFixed(2))
          }
        } catch (e: any) {
          const msg = String(e?.message || "")
          const okEmpty =
            msg.includes("não encontradas") ||
            msg.includes("HTTP 404") ||
            msg.includes("HTTP 403")
          if (!okEmpty) {
            console.warn("Erro ao buscar finance-infos:", msg)
          }
        } finally {
          setLoading(false)
        }
      })()
  }, [router])

  const toNumber2 = (val: string) => {
    const n = Number(String(val).replace(",", "."))
    if (Number.isNaN(n)) return 0
    return Number(n.toFixed(2))
  }

  const formatBRL = (v: string | number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(typeof v === "string" ? Number(v.replace(",", ".")) || 0 : v ?? 0)

  const openEdit = () => {
    setIncome(savedIncome)
    setProfission(savedProfission)
    setNetWorth(savedNetWorth)
    setOpen(true)
  }

  const clearModal = () => {
    setIncome("")
    setProfission("")
    setNetWorth("")
  }

  const handleSave = async () => {
    if (!clientId) {
      router.replace("/auth/login")
      return
    }

    if (!profission || profission.trim().length < 3) {
      error({
        title: "Profissão inválida",
        description: "Digite pelo menos 3 caracteres.",
      })
      return
    }

    const payload = {
      income: toNumber2(income),
      profission: profission.trim(),
      netWorth: toNumber2(netWorth),
    }

    setSaving(true)

    const createNew = async () => {
      const created = await api<FinanceInfo>(`/clients/${clientId}/finance-infos`, {
        method: "POST",
        auth: true,
        body: JSON.stringify(payload),
      })
      if (created?.id) {
        setRecordId(created.id)
        setSavedIncome(Number(created.income ?? payload.income).toFixed(2))
        setSavedProfission(created.profission ?? payload.profission)
        setSavedNetWorth(Number(created.netWorth ?? payload.netWorth).toFixed(2))
      }
    }

    try {
      if (recordId) {
        try {
          const updated = await api<FinanceInfo>(
            `/clients/${clientId}/finance-infos/${recordId}`,
            {
              method: "PATCH",
              auth: true,
              body: JSON.stringify(payload),
            }
          )
          if (updated?.id) {
            setRecordId(updated.id)
            setSavedIncome(Number(updated.income ?? payload.income).toFixed(2))
            setSavedProfission(updated.profission ?? payload.profission)
            setSavedNetWorth(Number(updated.netWorth ?? payload.netWorth).toFixed(2))
          }
        } catch (err: any) {
          const msg = String(err?.message || "")
          const patchBug =
            msg.includes("não encontradas") ||
            msg.includes("financeiras do cliente de id") ||
            msg.includes("HTTP 403") ||
            msg.includes("HTTP 500")

          if (patchBug) {
            try {
              await api(`/clients/${clientId}/finance-infos/${recordId}`, {
                method: "DELETE",
                auth: true,
              })
            } catch { }
            await createNew()
          } else {
            throw err
          }
        }
      } else {
        await createNew()
      }

      success({
        title: "Salvo",
        description: "Informações financeiras atualizadas.",
      })
      setOpen(false)
    } catch (err: any) {
      error({
        title: "Erro ao salvar",
        description: String(err?.message || "Não foi possível salvar."),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!clientId || !recordId) return
    setDeleting(true)
    try {
      await api(`/clients/${clientId}/finance-infos/${recordId}`, {
        method: "DELETE",
        auth: true,
      })
      setRecordId(null)
      setSavedIncome("0,00")
      setSavedProfission("")
      setSavedNetWorth("0,00")
      success({
        title: "Excluído",
        description: "As informações foram removidas.",
      })
    } catch (err: any) {
      error({
        title: "Erro ao excluir",
        description: String(err?.message || "Não foi possível excluir."),
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AppSidebar />

      <div className="flex-1 flex flex-col md:ml-60">
        <ProfileHeader showNotifications />

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 lg:px-0 py-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Configurações · Financeiro
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                Informações financeiras
              </h1>
              <p className="text-sm text-slate-500">
                Esses dados alimentam o dashboard, metas e relatórios.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Voltar para Dashboard
              </Button>
              {recordId ? (
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Excluindo..." : "Excluir informações"}
                </Button>
              ) : null}
            </div>
          </div>

          {/* cards de destaque */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/80 backdrop-blur border-slate-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Renda mensal
                </CardTitle>
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-slate-900">
                  {loading ? "..." : formatBRL(savedIncome)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Use valores médios ou fixos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-slate-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Patrimônio líquido
                </CardTitle>
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-slate-900">
                  {loading ? "..." : formatBRL(savedNetWorth)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Soma de bens menos dívidas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profissão / atividade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-semibold">
                  {loading ? "..." : savedProfission || "Não informado"}
                </p>
                <p className="text-xs text-emerald-50 mt-2">
                  Ajuda a gerar relatórios mais descritivos.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-4"
                  onClick={openEdit}
                >
                  {recordId ? "Editar" : "Cadastrar"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* detalhes */}
          <Card className="bg-white border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">
                Dados atuais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <p className="text-sm text-slate-400">Carregando...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Renda mensal
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatBRL(savedIncome)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Profissão / atividade
                    </p>
                    <p className="text-lg font-semibold text-slate-900 break-words">
                      {savedProfission || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Patrimônio líquido
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatBRL(savedNetWorth)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <PiggyBank className="w-4 h-4" />
                  <span>
                    Esses valores são usados no painel e podem ser alterados a qualquer
                    momento.
                  </span>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openEdit}>
                  {recordId ? "Editar informações" : "Cadastrar informações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {recordId ? "Editar informações financeiras" : "Cadastrar informações financeiras"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="income">Renda mensal</Label>
                <Input
                  id="income"
                  type="number"
                  step="0.01"
                  min="0"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="ex.: 2000,00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profission">Profissão / atividade</Label>
                <Input
                  id="profission"
                  value={profission}
                  onChange={(e) => setProfission(e.target.value)}
                  placeholder="ex.: MEI - serviços"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="netWorth">Patrimônio líquido</Label>
                <Input
                  id="netWorth"
                  type="number"
                  step="0.01"
                  value={netWorth}
                  onChange={(e) => setNetWorth(e.target.value)}
                  placeholder="ex.: 50000,00"
                />
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={clearModal}>
              Limpar campos
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
