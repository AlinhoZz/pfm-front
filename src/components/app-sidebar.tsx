"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Target,
  FileText,
  ReceiptText,
  Receipt,
  ChevronDown,
  Brain,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Despesas", href: "/expenses", icon: ArrowDownCircle },
  { label: "Receitas", href: "/revenues", icon: ArrowUpCircle },
  { label: "Metas", href: "/goals", icon: Target },
  { label: "Info financeira", href: "/finance-info", icon: Wallet },
  // nova aba da IA
]

const reportItems = [
  { label: "Relatório de despesas", href: "/reports/expenses", icon: Receipt },
  { label: "Relatório de receitas", href: "/reports/revenues", icon: ReceiptText },
  // novo: relatório inteligente com IA
  { label: "Relatório inteligente (IA)", href: "/reports/ia", icon: Brain },
]

function BrandBlock() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <img src="/icons/F.png" alt="Finer" className="h-10 w-10 object-contain" />
      <div className="text-center leading-tight">
        <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400">
          F I N E R.
        </p>
      </div>
    </div>
  )
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  const isReportsActive = pathname.startsWith("/reports")
  const [openReports, setOpenReports] = useState(isReportsActive)

  return (
    <>
      {/* header do sidebar */}
      <div className="border-b border-slate-800 flex items-center justify-center bg-slate-900">
        <BrandBlock />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 bg-slate-900">
        <div className="px-4 pb-2 text-xs font-medium text-slate-500">
          Navegação
        </div>
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-emerald-500/15 text-white border border-emerald-400/50"
                      : "text-slate-200 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>

                  {active && (
                    <span className="absolute right-1 top-1 bottom-1 w-[3px] rounded-full bg-emerald-400" />
                  )}
                </Link>
              </li>
            )
          })}

          <li className="pt-3">
            <p className="px-4 pb-1 text-xs font-medium text-slate-500">
              Relatórios
            </p>
            <button
              type="button"
              onClick={() => setOpenReports((p) => !p)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isReportsActive
                  ? "bg-emerald-500/10 text-white border border-emerald-400/40"
                  : "text-slate-200 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Relatórios</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openReports ? "rotate-180" : ""
                }`}
              />
            </button>

            {openReports && (
              <ul className="mt-1 space-y-1 pl-8">
                {reportItems.map((rep) => {
                  const Icon = rep.icon
                  const active = pathname === rep.href
                  return (
                    <li key={rep.href}>
                      <Link
                        href={rep.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                          active
                            ? "bg-emerald-500/20 text-white border border-emerald-400/40"
                            : "text-slate-200/85 hover:text-white hover:bg-slate-800/70"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="truncate">{rep.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* footer */}
      <div className="px-4 py-4 border-t border-slate-800 text-[11px] text-slate-500 text-center bg-slate-900">
        <p>v1.0 · painel financeiro</p>
      </div>
    </>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const [openMobile, setOpenMobile] = useState(false)

  return (
    <>
      {/* botão flutuante mobile */}
      <button
        onClick={() => setOpenMobile((p) => !p)}
        className="md:hidden fixed top-20 left-3 z-60 inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white shadow-lg transition-transform active:scale-95"
      >
        {openMobile ? "×" : "≡"}
      </button>

      {/* desktop */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 bg-slate-900 flex-col z-30 border-r border-slate-800">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* mobile */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
          openMobile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div onClick={() => setOpenMobile(false)} className="absolute inset-0 bg-black/40" />
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col
            transition-transform duration-200 ease-out
            ${openMobile ? "translate-x-0" : "-translate-x-full"}`}
        >
          <SidebarContent pathname={pathname} onNavigate={() => setOpenMobile(false)} />
        </div>
      </div>
    </>
  )
}
