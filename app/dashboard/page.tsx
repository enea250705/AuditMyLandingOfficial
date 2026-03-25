"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowRight, BarChart3, TrendingUp, Award, Gauge, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"

const loadingMessages = [
  "Fetching page...",
  "Reading headline...",
  "Analyzing CTA...",
  "Checking trust signals...",
  "Scoring social proof...",
  "Calculating final score...",
]

type Audit = {
  id: string
  url: string
  score: number
  created_at: string
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : score >= 60
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30"
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
      {score}/100
    </span>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)
  const [audits, setAudits] = useState<Audit[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    bestScore: 0,
    auditsLeft: 3,
  })
  const loadingInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)

      supabase
        .from("audits")
        .select("id, url, score, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data: auditData }) => {
          if (auditData) {
            setAudits(auditData)
            const total = auditData.length
            const avgScore = total > 0 ? Math.round(auditData.reduce((a, b) => a + b.score, 0) / total) : 0
            const bestScore = total > 0 ? Math.max(...auditData.map((a) => a.score)) : 0
            setStats({ total, avgScore, bestScore, auditsLeft: Math.max(0, 3 - total) })
          }
        })
    })
  }, [])

  async function handleAudit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setLoadingMsgIndex(0)

    loadingInterval.current = setInterval(() => {
      setLoadingMsgIndex((prev) => Math.min(prev + 1, loadingMessages.length - 1))
    }, 800)

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), userId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Audit failed")
      }

      if (data.id) {
        router.push(`/audit/${data.id}`)
      } else {
        // Store result in session storage for display without DB
        sessionStorage.setItem("pendingAudit", JSON.stringify({ ...data, url }))
        router.push("/audit/preview")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      alert(message)
    } finally {
      if (loadingInterval.current) clearInterval(loadingInterval.current)
      setLoading(false)
    }
  }

  const statCards = [
    { label: "Total Audits", value: stats.total, icon: BarChart3, color: "text-zinc-400" },
    { label: "Avg Score", value: stats.avgScore || "—", icon: TrendingUp, color: "text-blue-400" },
    { label: "Best Score", value: stats.bestScore || "—", icon: Award, color: "text-emerald-400" },
    { label: "Audits Left", value: stats.auditsLeft, icon: Gauge, color: "text-amber-400" },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: "var(--font-cal-sans)" }}
        >
          Dashboard
        </h1>
        <p className="text-zinc-400 text-sm">Audit your landing pages and find conversion leaks.</p>
      </div>

      {/* Run New Audit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-white mb-1">Run a New Audit</h2>
        <p className="text-zinc-400 text-sm mb-4">
          Paste any landing page URL and get an AI-powered conversion score in seconds.
        </p>
        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourlandingpage.com"
            required
            disabled={loading}
            className="flex-1 h-11 px-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={loading}
            className="shimmer-btn h-11 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl px-6 font-medium shrink-0"
          >
            Analyze
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-700 border-t-white animate-spin mx-auto mb-6" />
              <h3 className="text-white font-semibold mb-2">Analyzing your page</h3>
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMsgIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-zinc-400 text-sm"
                >
                  {loadingMessages[loadingMsgIndex]}
                </motion.p>
              </AnimatePresence>
              <div className="mt-4 flex justify-center gap-1">
                {loadingMessages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i <= loadingMsgIndex ? "bg-white w-4" : "bg-zinc-700 w-1.5"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">{card.label}</span>
              <card.icon className={`w-4 h-4 ${card.color}`} strokeWidth={1.5} />
            </div>
            <p
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-cal-sans)" }}
            >
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Past Audits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Past Audits</h2>
        </div>

        {audits.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-zinc-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-white font-semibold mb-2">No audits yet</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">
              Run your first audit to see how your landing page performs and get actionable fixes.
            </p>
            <Button
              onClick={() => document.querySelector("input[type='url']")?.focus()}
              className="bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-6"
            >
              Run Your First Audit
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {audits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <span className="text-sm text-zinc-300 truncate">{audit.url}</span>
                        <a
                          href={audit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ScoreBadge score={audit.score} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-500">
                        {new Date(audit.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/audit/${audit.id}`)}
                        className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 rounded-lg text-xs bg-transparent"
                      >
                        View Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
