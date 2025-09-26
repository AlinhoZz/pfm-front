import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="h-[100svh] bg-white overflow-hidden relative flex flex-col">
      <div
        className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#07f9a2] via-[#09c184] to-[#0a8967]"
        style={{ clipPath: "ellipse(60% 100% at 80% 0%)" }}
      >
        <div className="pointer-events-none relative w-full h-full">
          <div className="absolute top-20 right-20 w-4 h-4 bg-white/20 rounded-full" />
          <div className="absolute top-32 right-32 w-2 h-2 bg-white/30 rounded-full" />
          <div className="absolute top-40 right-16 w-3 h-3 bg-white/25 rounded-full" />
          <div className="absolute top-60 right-40 w-1 h-1 bg-white/40 rounded-full" />
          <div className="absolute top-80 right-24 w-2 h-2 bg-white/35 rounded-full" />
          <div className="absolute top-40 right-60 w-8 h-8 border-2 border-white/20 rounded-full" />
          <div className="absolute top-72 right-72 w-10 h-10 border-2 border-white/15 rounded-full" />
        </div>
      </div>

      <header className="relative z-10">
        {/* Adicionado max-w-screen-xl para alinhar com o conteúdo principal */}
        <div className="container mx-auto max-w-screen-xl px-6 lg:px-8">
          <div className="flex h-14 lg:h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Adicionada a classe font-serif para mudar a fonte */}
              <span className="font-serif text-xl font-bold text-[#0c5149] tracking-wide uppercase">
                Gerenciamento de Finanças
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#sobre" className="text-white hover:text-white/80 transition-colors">Sobre</a>
              <a href="#produto" className="text-white hover:text-white/80 transition-colors">Produto</a>
              <a href="#servicos" className="text-white hover:text-white/80 transition-colors">Serviços</a>
              <a href="#precos" className="text-white hover:text-white/80 transition-colors">Preços</a>
              <a href="#login" className="text-white hover:text-white/80 transition-colors">Login</a>
            </nav>
            <a href="/auth/login">
              <Button className="bg-white text-[#0c5149] hover:bg-gray-50 rounded-full px-6 h-10">Entrar</Button>
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-grow flex items-center">
        <div className="container mx-auto max-w-screen-xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#0c5149] leading-tight">
                Gerencie suas finanças com inteligência
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                Sistema completo de gestão financeira desenvolvido especialmente para jovens microempreendedores. Organize receitas, despesas e metas com sugestões de IA.
              </p>
              <a href="/auth/login">
                <Button className="bg-[#0a8967] hover:bg-[#0c5149] text-white rounded-full px-6 h-11 text-base">
                  Entrar
                </Button>
              </a>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative">
                <img
                  src="\icons\a (1).png"
                  alt="Dashboard de gestão financeira"
                  className="w-full max-w-[550px] h-auto"
                />
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#07f9a2] rounded-full shadow-lg" />
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-[#09c184] rounded-full shadow-lg" />
                <div className="absolute top-1/2 -right-5 w-4 h-4 bg-[#0a8967] rounded-full shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}