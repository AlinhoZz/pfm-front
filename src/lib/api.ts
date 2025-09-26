export type ApiOptions = RequestInit & { auth?: boolean };

export async function api<T = any>(path: string, options: ApiOptions = {}) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,

    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  try { return (await res.json()) as T; } catch { return undefined as T; }
}
