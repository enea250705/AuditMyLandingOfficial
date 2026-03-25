"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutDashboard, Plus, Settings, LogOut, Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Audit", href: "/dashboard/new", icon: Plus },
  { label: "Settings", href: "/settings", icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [plan, setPlan] = useState("Free")
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login")
        return
      }
      setUser(data.user)

      supabase
        .from("profiles")
        .select("plan")
        .eq("id", data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.plan) {
            setPlan(profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1))
          }
        })
    })
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800 w-64 p-4">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <span className="text-zinc-950 font-bold text-sm">AML</span>
        </div>
        <span className="font-semibold text-white">AuditMyLanding</span>
      </a>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <item.icon className="w-4 h-4" strokeWidth={1.5} />
              {item.label}
            </a>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-zinc-800 pt-4 mt-4">
        <div className="px-3 mb-3">
          <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Zap className="w-3 h-3 text-emerald-500" strokeWidth={1.5} />
            <span className="text-xs text-emerald-400 font-medium">{plan} Plan</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <div className="noise-overlay" aria-hidden="true" />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-zinc-950 font-bold text-xs">AML</span>
          </div>
          <span className="font-semibold text-white text-sm">AuditMyLanding</span>
        </a>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-zinc-900 border-b border-zinc-800 p-4"
        >
          <nav className="space-y-1 mb-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                {item.label}
              </a>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </motion.div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto lg:ml-0 pt-14 lg:pt-0">{children}</main>
    </div>
  )
}
