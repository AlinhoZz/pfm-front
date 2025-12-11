export function decodeJwt<T = unknown>(token: string | null | undefined): T | null {
  try {
    if (!token) return null
    const [, payload] = token.split(".")
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json) as T
  } catch {
    return null
  }
}