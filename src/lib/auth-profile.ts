const API_BASE =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_BASE_URL

export function applyLoginProfile(
  email: string,
  token: string,
  clientId?: string,
  nameFromAuth?: string
) {
  if (typeof window === "undefined") return

  ;(async () => {
    try {
      localStorage.setItem("token", token)
      localStorage.setItem("userEmail", email)
      if (clientId) {
        localStorage.setItem("clientId", clientId)
      }

      let finalName: string | null =
        nameFromAuth && nameFromAuth.trim().length >= 2
          ? nameFromAuth.trim()
          : null

      let finalEmail: string | null = email

      if (clientId) {
        const base = API_BASE || "http://localhost:8080"

        try {
          const res = await fetch(`${base}/clients/${clientId}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          })

          if (res.ok) {
            const client = await res.json()

            if (client?.name && client.name.trim().length >= 2) {
              finalName = client.name.trim()
              localStorage.setItem("clientName", client.name.trim())
            }

            if (client?.email) {
              finalEmail = client.email
            }
          }
        } catch (err) {
          console.error("Erro ao buscar dados do cliente:", err)
        }
      }

      if (!finalName) {
        finalName = email
          .split("@")[0]
          .replace(/\./g, " ")
          .split(" ")
          .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
          .join(" ")
      }

      localStorage.setItem("userName", finalName)
      localStorage.setItem("userEmail", finalEmail ?? email)

      window.dispatchEvent(new Event("auth:profile-updated"))
    } catch (e) {
      console.error("Erro ao aplicar perfil de login:", e)
    }
  })()
}
