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
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Despesas", href: "/expenses", icon: ArrowDownCircle },
  { label: "Receitas", href: "/revenues", icon: ArrowUpCircle },
  { label: "Metas", href: "/goals", icon: Target },
  { label: "Info financeira", href: "/finance-info", icon: Wallet },
  { label: "Relatórios", href: "/reports/expenses", icon: FileText },
]

function BrandBlock() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <img src="/icons/logo.png" alt="Finer" className="h-10 w-10 object-contain" />
      <div className="text-center leading-tight">
        <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400">F I N E R.</p>
        <p className="text-xs text-slate-200">Painel financeiro</p>
      </div>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const [openMobile, setOpenMobile] = useState(false)

  return (
    <>
      {/* bolinha verde SEMPRE por cima */}
      <button
        onClick={() => setOpenMobile((p) => !p)}
        className="md:hidden fixed top-20 left-3 z-60 inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white shadow-lg transition-transform active:scale-95"
      >
        {openMobile ? "×" : "≡"}
      </button>

      {/* desktop */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 bg-slate-900 flex-col z-30">
        <div className="border-b border-slate-800 flex items-center justify-center">
          <BrandBlock />
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const active =
                pathname === item.href ||
                (item.href.startsWith("/reports") && pathname.startsWith("/reports"))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                      active
                        ? "bg-emerald-400/20 text-white border border-emerald-400/50"
                        : "text-slate-200 hover:bg-slate-800/70"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400 text-center">
          v1.0 · painel financeiro
        </div>
      </aside>

      {/* mobile sempre montado + animação */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
          openMobile ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* fundo */}
        <div
          onClick={() => setOpenMobile(false)}
          className="absolute inset-0 bg-black/40"
        />

        {/* drawer */}
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col
            transition-transform duration-200 ease-out
            ${openMobile ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="border-b border-slate-800 flex items-center justify-center">
            <BrandBlock />
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon
                const active =
                  pathname === item.href ||
                  (item.href.startsWith("/reports") && pathname.startsWith("/reports"))
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpenMobile(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                        active
                          ? "bg-emerald-400/20 text-white border border-emerald-400/40"
                          : "text-slate-200 hover:bg-slate-800/70"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
