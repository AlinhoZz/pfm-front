"use client"

type GlobalLoaderProps = {
  active: boolean
  gifSrc?: string
}

export default function GlobalLoader({
  active,
  gifSrc = "/icons/skateboard-13963.gif", 
}: GlobalLoaderProps) {
  if (!active) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70">
      <img
        src={gifSrc}
        alt="Carregando"
        className="h-32 w-auto md:h-40 select-none pointer-events-none"
      />
    </div>
  )
}
