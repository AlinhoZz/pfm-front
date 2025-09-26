"use client"

import { useRouter } from "next/navigation"
import ProfileHeader from "@/components/profile-header"

export default function ApplicationPage() {
  const router = useRouter()

  const handleLogout = () => {
    try {
      localStorage.removeItem("token")
    } catch {}
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader
        onLogout={handleLogout}
        showNotifications
        notificationCount={2}
      />

      <main className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-semibold text-gray-700">Aplicação</h1>
      </main>
    </div>
  )
}
