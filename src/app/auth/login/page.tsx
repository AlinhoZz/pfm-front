"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";

async function loginRequest(email: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ token: string }>;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [keep, setKeep] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const emailError =
    email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "E-mail inválido." : null;
  const pwdError = password && password.length < 6 ? "Mínimo de 6 caracteres." : null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (emailError || pwdError) return;

    try {
      setLoading(true);
      const { token } = await loginRequest(email.trim(), password);
      if (keep) localStorage.setItem("token", token);
      router.replace("/");
    } catch (e: any) {
      setErr(e?.message || "Falha ao autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute -inset-8 -z-10 overflow-hidden">
        <Image
          src="/icons/fb_login.png"
          alt="Fundo"
          fill
          priority
          sizes="100vw"
          className="object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <main className="relative grid h-full place-items-center p-4">
        <section className="w-full max-w-md rounded-2xl border border-white/50 bg-white/70 shadow-2xl supports-[backdrop-filter]:bg-white/60 backdrop-blur-xl backdrop-brightness-110 backdrop-saturate-150">
          <header className="p-6 border-b border-white/40">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Entrar</h1>
            <p className="mt-1 text-sm text-slate-700/80">
              Acesse sua conta para gerenciar suas finanças.
            </p>
          </header>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-800">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="email"
                required
              />
              {emailError && <p className="text-xs text-red-600">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-800">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-indigo-500"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute inset-y-0 right-2 grid place-items-center rounded-md px-2 text-slate-600 hover:text-slate-900"
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {pwdError && <p className="text-xs text-red-600">{pwdError}</p>}
            </div>

            <div className="flex items-center justify-between pt-1 text-sm">
              <label className="inline-flex items-center gap-2 select-none text-slate-800">
                <input
                  type="checkbox"
                  checked={keep}
                  onChange={(e) => setKeep(e.target.checked)}
                  className="size-4 rounded border border-slate-300"
                />
                Lembrar-me
              </label>
              <Link
                href="/forgot-password"
                className="text-slate-700 hover:text-slate-900 hover:underline underline-offset-4"
              >
                Esqueci minha senha
              </Link>
            </div>

            {err && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!emailError || !!pwdError}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogIn className="size-4" />
              {loading ? "Entrando..." : "Login"}
            </button>

            <p className="text-sm text-slate-700 text-center">
              Não tem conta?{" "}
              <Link
                href="/register"
                className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
              >
                Criar conta
              </Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
