import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="noise-overlay" aria-hidden="true" />
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}
