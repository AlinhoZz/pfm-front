"use client"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 lg:px-0 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icons/F.png"
              alt="Finer"
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-slate-900 font-semibold text-sm md:text-base">
                F I N E R.
              </span>
              <span className="text-slate-500 tracking-wide uppercase text-[10px] md:text-xs">
                Gestão financeira
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
            <a href="#produto" className="hover:text-emerald-600 transition-colors">
              Produto
            </a>
            <a href="#solucoes" className="hover:text-emerald-600 transition-colors">
              Soluções
            </a>
            <a href="#precos" className="hover:text-emerald-600 transition-colors">
              Preços
            </a>
            <a href="#contato" className="hover:text-emerald-600 transition-colors">
              Contato
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center h-9 px-4 rounded-full border border-blue-400 text-blue-500 bg-transparent text-sm hover:bg-blue-50"
            >
              Entrar
            </a>
            <a href="/register">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 text-sm">
                Começar grátis
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className="flex-1 relative overflow-hidden bg-[#0aa16f]">
        {/* fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0aa16f] via-[#07895f] to-[#04533a]" />
        <div className="absolute -right-40 -top-32 h-[420px] w-[420px] border-2 border-emerald-300/20 rounded-3xl rotate-6" />
        <div className="absolute right-12 top-24 h-9 w-9 bg-white/8 rounded-full" />
        <div className="absolute right-40 bottom-24 h-10 w-10 bg-emerald-200/15 rounded-full" />
        <div className="absolute left-[-80px] bottom-[-80px] h-56 w-56 bg-emerald-950/20 rounded-full blur-2xl" />

        <div className="relative max-w-6xl mx-auto px-4 lg:px-0 py-16 lg:py-20 grid lg:grid-cols-2 gap-14 items-center">
          {/* texto */}
          <div className="text-left space-y-6">
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1 bg-emerald-950/30 text-emerald-50 rounded-full border border-emerald-50/10">
              Plataforma para MEIs e autônomos
            </div>

            {/* bloco de texto em um “card” leve, mais parecido com o app */}
            <div className="bg-emerald-950/20 border border-emerald-50/10 rounded-2xl p-5 md:p-6 backdrop-blur-sm max-w-xl">
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                Controle financeiro
                <span className="block text-emerald-50/80 text-[0.70em] font-normal mt-2">
                  sem planilhas e sem misturar contas
                </span>
              </h1>
              <p className="mt-4 text-sm lg:text-base text-emerald-50/90">
                Centralize receitas, despesas, metas e relatórios em um único painel.
                Visão clara de caixa, alertas e relatórios prontos para enviar ao contador.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <a href="/login">
                  <Button className="bg-white text-emerald-700 hover:bg-slate-50 rounded-full px-7 h-11 text-sm font-semibold shadow-[0_12px_35px_rgba(0,0,0,0.15)]">
                    Acessar painel
                  </Button>
                </a>
                <span className="text-emerald-50/80 text-xs md:text-sm">
                  100% online · Totalmente grátis
                </span>
              </div>
            </div>

            {/* métricas */}
            <div className="grid grid-cols-3 gap-3 max-w-md pt-4">
              <div className="bg-emerald-950/15 border border-emerald-50/8 rounded-xl p-3">
                <p className="text-lg font-semibold text-white">R$ 18k</p>
                <p className="text-[11px] text-emerald-50/70">Em receitas monitoradas</p>
              </div>
              <div className="bg-emerald-950/15 border border-emerald-50/8 rounded-xl p-3">
                <p className="text-lg font-semibold text-white">+45</p>
                <p className="text-[11px] text-emerald-50/70">Despesas categorizadas</p>
              </div>
              <div className="bg-emerald-950/15 border border-emerald-50/8 rounded-xl p-3">
                <p className="text-lg font-semibold text-white">3 módulos</p>
                <p className="text-[11px] text-emerald-50/70">Receitas · Despesas · Metas</p>
              </div>
            </div>
          </div>

          {/* mockup */}
          <div className="relative h-[430px]">
            {/* dashboard principal */}
            <div className="absolute right-0 top-4 bg-white/95 backdrop-blur w-[360px] lg:w-[390px] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-emerald-900/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-500 mb-1">
                    F I N E R.
                  </p>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Visão geral financeira
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-100">
                  Ativo
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* saldo + resumo */}
                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between gap-3 border border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 tracking-wide">
                      Saldo projetado
                    </p>
                    <p className="text-xl font-semibold text-slate-900">R$ 6.480,00</p>
                    <p className="text-[10px] text-slate-400">Atualizado há 3 min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-emerald-600 font-medium">+ 18% este mês</p>
                    <p className="text-[10px] text-slate-400">metas batidas: 2/3</p>
                  </div>
                </div>

                {/* lista */}
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                    Entradas recentes
                  </p>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-700 truncate">Pix - Cliente 021</span>
                    <span className="text-emerald-600 font-medium">+ R$ 820,00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-700 truncate">Pagamento MEI</span>
                    <span className="text-rose-500 font-medium">- R$ 65,00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-700 truncate">Assinatura mensal</span>
                    <span className="text-emerald-600 font-medium">+ R$ 290,00</span>
                  </div>
                </div>

                {/* botão fake */}
                <button className="w-full h-9 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition">
                  Ir para o painel
                </button>
              </div>
            </div>

            {/* card de metas */}
            <div className="absolute -left-6 bottom-6 bg-white/92 backdrop-blur w-[190px] rounded-xl shadow-[0_12px_45px_rgba(0,0,0,0.25)] border border-emerald-900/5 p-4">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">
                Meta ativa
              </p>
              <p className="text-sm font-semibold text-slate-900">Reserva de emergência</p>
              <p className="text-xs text-slate-500 mb-3">R$ 2.400 / 5.000</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[48%]" />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">48% concluído</p>
            </div>

            {/* badge amarelo atualizado */}
            <div className="absolute -bottom-10 right-10 bg-[#f9d34f] text-emerald-950 px-6 py-5 rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <p className="text-3xl font-bold leading-none">+52%</p>
              <p className="text-[10px] uppercase tracking-[0.3em] mt-1">visão de caixa</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
