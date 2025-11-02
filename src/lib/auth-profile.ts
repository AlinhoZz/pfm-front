export function applyLoginProfile(
  email: string,
  token: string,
  clientId?: string,
  name?: string
) {
  if (typeof window === "undefined") return

  localStorage.setItem("token", token)
  localStorage.setItem("userEmail", email)
  if (clientId) {
    localStorage.setItem("clientId", clientId)
  }

  const pretty =
    name && name.trim().length >= 3
      ? name
      : email
          .split("@")[0]
          .replace(/\./g, " ")
          .split(" ")
          .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
          .join(" ")

  localStorage.setItem("userName", pretty)
  window.dispatchEvent(new Event("auth:profile-updated"))
}
