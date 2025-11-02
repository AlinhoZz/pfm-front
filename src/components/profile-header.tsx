"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, LogOut, Bell, Circle } from "lucide-react"

interface ProfileHeaderProps {
  showNotifications?: boolean
  notificationCount?: number
  onLogout?: () => void
  title?: string
  subtitle?: string
}

export default function ProfileHeader({
  showNotifications = true,
  notificationCount = 0,
  onLogout,
}: ProfileHeaderProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [nameState, setNameState] = useState<string | null>(null)
  const [emailState, setEmailState] = useState<string | null>(null)
  const [clientName, setClientName] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = () => {
      try {
        const lsName = localStorage.getItem("userName")
        const lsEmail = localStorage.getItem("userEmail")
        const lsClientName = localStorage.getItem("clientName")
        setNameState(lsName || null)
        setEmailState(lsEmail || null)
        setClientName(lsClientName || null)
      } catch {}
    }

    loadProfile()

    const onStorage = (e: StorageEvent) => {
      if (e.key === "userName" || e.key === "userEmail" || e.key === "clientName") loadProfile()
    }
    const onUpdate = () => loadProfile()
    const onFocus = () => loadProfile()

    window.addEventListener("storage", onStorage)
    window.addEventListener("auth:profile-updated", onUpdate as EventListener)
    window.addEventListener("focus", onFocus)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("auth:profile-updated", onUpdate as EventListener)
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  const initials = useMemo(() => {
    const n = nameState || "Usuário"
    return n
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [nameState])

  const handleLogout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("userName")
      localStorage.removeItem("userEmail")
    } catch {}
    onLogout?.()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 h-14 flex items-center justify-between gap-4">
        {/* ESQUERDA: título + breadcrumb + cliente atual */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Finer • {clientName ? clientName : "Cliente padrão"}
            </p>
          </div>
        </div>

        {/* DIREITA: notificações + user */}
        <div className="flex items-center gap-2 sm:gap-4">
          {showNotifications && (
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors">
                <Bell size={18} />
              </button>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full hover:bg-slate-50 transition-colors pl-1 pr-2 py-1"
            >
              <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <div className="hidden sm:block text-left leading-tight max-w-[130px]">
                <p className="text-xs font-medium text-slate-900 truncate">
                  {nameState || "Usuário"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {emailState || "email@exemplo.com"}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {nameState || "Usuário"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {emailState || "email@exemplo.com"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} aria-hidden />
      )}
    </header>
  )
}
