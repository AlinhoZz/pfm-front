export function getClientId() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("clientId")
}
