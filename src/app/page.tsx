"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  Target,
  TrendingUp,
  Wallet,
  PieChart,
  Calculator,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg ring-1 ring-slate-200">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Finanças Pessoais
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-sm font-medium text-slate-500 hover:text-slate-900">
                Recursos
              </a>
              <a href="#sobre" className="text-sm font-medium text-slate-500 hover:text-slate-900">
                Sobre
              </a>
              <a href="#contato" className="text-sm font-medium text-slate-500 hover:text-slate-900">
                Contato
              </a>
            </nav>

            <Button
              asChild
              className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
            >
              <Link href="/auth/login">Acessar Conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-24 lg:py-40">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          </div>

          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <Badge className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Controle Financeiro Inteligente
              </Badge>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                Gerencie suas finanças com{" "}
                <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  simplicidade
                </span>
              </h1>

              <p className="mx-auto max-w-3xl text-lg sm:text-xl leading-8 text-slate-600">
                Acesse sua conta para gerenciar receitas, despesas, metas e relatórios. Tenha controle total das suas
                finanças em uma plataforma intuitiva e segura.
              </p>

              <div className="flex items-center justify-center">
                <Button
                  asChild
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
                >
                  <Link href="/auth/login">
                    Começar Agora
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="bg-slate-50 py-24 overflow-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Tudo para suas finanças</h2>
              <p className="text-lg sm:text-xl text-slate-600">Organize, acompanhe e planeje seu futuro financeiro</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { Icon: Wallet, title: "Receitas e Despesas", desc: "Registre e categorize suas transações com facilidade." },
                { Icon: Target, title: "Metas Financeiras", desc: "Defina objetivos e acompanhe seu progresso." },
                { Icon: BarChart3, title: "Relatórios Detalhados", desc: "Gráficos e relatórios personalizados." },
                { Icon: PieChart, title: "Análise por Categorias", desc: "Veja para onde vai seu dinheiro." },
                { Icon: Calculator, title: "Planejamento", desc: "Orçamentos mensais e alertas de limite." },
                { Icon: TrendingUp, title: "Insights", desc: "Dicas para melhorar sua saúde financeira." },
              ].map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl p-8 border border-slate-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-blue-500/10">
                    <Icon className="h-7 w-7 text-indigo-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                  <p className="text-slate-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
