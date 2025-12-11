export type ApiOptions = RequestInit & {
  auth?: boolean;
};

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  const isBrowser = typeof window !== "undefined";
  const headers = new Headers(options.headers || {});

  // Se tiver body e não for FormData, define JSON
  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Auth via localStorage
  if (options.auth && isBrowser) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // CSRF/XSRF (se existir cookie)
  if (isBrowser) {
    const cookie = document.cookie
      .split("; ")
      .find(
        (c) => c.startsWith("csrftoken=") || c.startsWith("XSRF-TOKEN=")
      );

    if (cookie) {
      const value = decodeURIComponent(cookie.split("=")[1]);
      if (!headers.has("X-CSRFToken")) {
        headers.set("X-CSRFToken", value);
      }
      if (!headers.has("X-XSRF-TOKEN")) {
        headers.set("X-XSRF-TOKEN", value);
      }
    }
  }

  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  try {
    return (await res.json()) as T;
  } catch {
    // ex.: 204 No Content
    return undefined as T;
  }
}
