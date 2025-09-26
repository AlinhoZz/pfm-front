"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, LogOut, Bell } from "lucide-react"

interface ProfileHeaderProps {
  showNotifications?: boolean
  notificationCount?: number
  onLogout?: () => void
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

  useEffect(() => {
    const loadProfile = () => {
      try {
        const lsName = localStorage.getItem("userName")
        const lsEmail = localStorage.getItem("userEmail")
        setNameState(lsName || null)
        setEmailState(lsEmail || null)
      } catch {}
    }

    loadProfile()

    const onStorage = (e: StorageEvent) => {
      if (e.key === "userName" || e.key === "userEmail") loadProfile()
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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary tracking-wide">GERENCIAMENTO DE FINANÇAS</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {showNotifications && (
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                {initials}
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{nameState || "Usuário"}</p>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">{emailState || "email@exemplo.com"}</p>
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{nameState || "Usuário"}</p>
                  <p className="text-xs text-gray-500 truncate">{emailState || "email@exemplo.com"}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />}
    </header>
  )
}
