import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
        <img src="/icons/logo.png" alt="Finanças Jovem" className="h-10 w-auto object-contain" />
        <div className="flex flex-col leading-tight">
          <span className="text-slate-900 font-semibold text-sm md:text-base">F I N E R.</span>
          <span className="text-slate-500 tracking-wide uppercase text-[10px] md:text-xs">Gestão financeira</span>
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
              href="/auth/login"
              className="inline-flex items-center justify-center h-9 px-4 rounded-full border border-blue-500 text-blue-600 bg-transparent text-sm hover:bg-blue-50"
            >
              Entrar
            </a>
            <a href="/auth/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 h-9 text-sm">
              Começar grátis
              </Button>
            </a>
            </div>
        </div>
      </header>

      {/* HERO */}
      <main className="flex-1 relative overflow-hidden bg-[#0aa16f]">
        {/* faixa verde como no unbounce */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0aa16f] via-[#07895f] to-[#056b4a]" />

        {/* “linhas” e elementos de fundo */}
        <div className="absolute -right-40 -top-32 h-[500px] w-[500px] border-2 border-emerald-300/40 rounded-3xl rotate-6" />
        <div className="absolute right-10 top-12 h-10 w-10 bg-white/10 rounded-full" />
        <div className="absolute right-40 bottom-20 h-6 w-6 bg-emerald-200/40 rounded-full" />
        <div className="absolute right-72 top-52 h-14 w-14 border border-white/20 rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 lg:px-0 py-16 lg:py-20 grid lg:grid-cols-2 gap-14 items-center">
          {/* TEXTO */}
          <div className="text-left">
            <p className="text-sm tracking-[0.18em] uppercase text-emerald-50/80 mb-6">
              Sistema financeiro para MEIs
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Gerencie suas finanças
              <br /> com inteligência
            </h1>
            
            <p className="text-base lg:text-lg text-emerald-50/90 max-w-md mb-8">
              Sistema completo de gestão financeira desenvolvido especialmente para jovens microempreendedores.
              Organize receitas, despesas e metas com sugestões de IA.
            </p>

            <div className="flex flex-wrap items-center gap-4">
                <a href="/auth/login">
                <Button className="bg-[#0e5e64] hover:bg-[#0b4e52] text-white rounded-full px-7 h-11 text-sm">
                  Começar agora
                </Button>
                </a>
              <span className="text-emerald-50/80 text-sm">
                33% mais conversões em planos pagos
              </span>
            </div>
          </div>

          {/* MOCKUP LADO DIREITO (estilo cards flutuando) */}
          <div className="relative h-[420px]">
            {/* cartão principal */}
            <div className="absolute right-0 top-4 bg-[#f9e1cf] w-[360px] lg:w-[400px] rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-emerald-900/5">
              <div className="border-b border-slate-200/50 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-900/70">FinEr.</p>
                  <h2 className="text-lg font-semibold text-emerald-950">Finanças, simplificadas</h2>
                </div>
                <span className="h-8 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs text-emerald-800">
                  MEI
                </span>
              </div>
              <div className="px-6 py-5 space-y-3">
                <p className="text-sm text-emerald-950/80">
                  Inclui controle de contas, fluxo de caixa e painel de IA.
                </p>
                <div className="bg-white rounded-md border border-emerald-950/5 p-3 flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wide text-slate-500">Seu e-mail</label>
                  <input
                    className="bg-transparent text-sm outline-none"
                    placeholder="voce@negocio.com"
                  />
                </div>
                
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full rounded-md h-9 text-sm">
                  Ver demonstração
                </Button>
              </div>
              {/* depoimento */}
              <div className="px-6 py-4 bg-[#f6d3b3] rounded-b-md flex gap-3 items-center">
                <div className="h-10 w-10 rounded-full bg-emerald-900/10 flex items-center justify-center text-[11px] font-semibold text-emerald-950">
                  AH
                </div>
                <div>
                  <p className="text-xs text-emerald-950/90">
                    “Me ajudou a manter minhas despesas em dia.”
                  </p>
                  <p className="text-[10px] text-emerald-950/50">Alisson – Microempreendedor</p>
                </div>
              </div>
            </div>

            {/* “laptop” flutuando em cima */}
            <div className="absolute -top-15 right-16 bg-white w-[230px] rounded-lg shadow-[0_16px_45px_rgba(0,0,0,0.18)] border border-emerald-900/5">
              <div className="flex">
                <div className="w-14 bg-emerald-700 text-white text-xs py-4 px-3 rounded-l-lg">
                  <p className="font-semibold">Visão</p>
                  <p className="text-[10px] mt-2 text-emerald-50/80">Receitas</p>
                  <p className="text-[10px] text-emerald-50/80">Despesas</p>
                  <p className="text-[10px] text-emerald-50/80">Metas</p>
                </div>
                <div className="flex-1 p-3">
                  <p className="text-[10px] text-slate-500 mb-2">Resumo diário</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-600">Entradas</span>
                      <span className="text-emerald-600 font-semibold">R$ 1.280</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-600">Saídas</span>
                      <span className="text-red-500 font-semibold">R$ 620</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-600">Saldo</span>
                      <span className="text-slate-900 font-semibold">R$ 660</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* badge amarelinho embaixo */}
            <div className="absolute -bottom-8 left-14 bg-[#f9d34f] text-emerald-950 px-6 py-5 rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <p className="text-3xl font-bold leading-none">33%</p>
              <p className="text-xs uppercase tracking-[0.3em] mt-1">mais conversões</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
