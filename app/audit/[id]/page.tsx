"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, RotateCcw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"

type Category = {
  score: number
  insight: string
}

type Fix = {
  title: string
  priority: "Critical" | "High" | "Medium"
  problem: string
  fix: string
}

type AuditResult = {
  id: string
  url: string
  score: number
  result: {
    overallScore: number
    categories: {
      headline: Category
      cta: Category
      trustSignals: Category
      copyClarity: Category
      socialProof: Category
    }
    fixes: Fix[]
  }
  created_at: string
}

function AnimatedScoreRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = (displayScore / 100) * circumference
  const dashOffset = circumference - progress

  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"
  const trackColor = score >= 80 ? "#10b98120" : score >= 60 ? "#f59e0b20" : "#ef444420"

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 1600
    const step = Math.ceil(duration / score)
    const timer = setInterval(() => {
      start += 1
      setDisplayScore(start)
      if (start >= score) clearInterval(timer)
    }, step)
    return () => clearInterval(timer)
  }, [isInView, score])

  return (
    <div ref={ref} className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (displayScore / 100) * circumference}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold text-white leading-none"
          style={{ fontFamily: "var(--font-cal-sans)", color }}
        >
          {displayScore}
        </span>
        <span className="text-xs text-zinc-500 mt-1">out of 100</span>
      </div>
    </div>
  )
}

const categoryLabels: Record<string, string> = {
  headline: "Headline",
  cta: "CTA",
  trustSignals: "Trust Signals",
  copyClarity: "Copy Clarity",
  socialProof: "Social Proof",
}

const priorityConfig: Record<string, string> = {
  Critical: "bg-red-500/20 text-red-400 border-red-500/30",
  High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

export default function AuditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const categoriesRef = useRef(null)
  const categoriesInView = useInView(categoriesRef, { once: true })

  useEffect(() => {
    if (!id || id === "preview") {
      // Load from session storage for non-authenticated preview
      const pending = sessionStorage.getItem("pendingAudit")
      if (pending) {
        const data = JSON.parse(pending)
        setAudit({
          id: "preview",
          url: data.url,
          score: data.overallScore,
          result: data,
          created_at: new Date().toISOString(),
        })
      }
      setLoading(false)
      return
    }

    const supabase = createClient()
    supabase
      .from("audits")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError("Audit not found")
        } else {
          setAudit(data)
        }
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">{error || "Audit not found"}</p>
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const categories = audit.result.categories
  const categoryEntries = Object.entries(categories) as [string, Category][]
  const sortedFixes = [...(audit.result.fixes || [])].sort((a, b) => {
    const order = { Critical: 0, High: 1, Medium: 2 }
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3)
  })

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="noise-overlay" aria-hidden="true" />
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl mb-6 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Score Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6 text-center"
        >
          <AnimatedScoreRing score={audit.score} />
          <h1
            className="text-2xl font-bold text-white mt-4 mb-2"
            style={{ fontFamily: "var(--font-cal-sans)" }}
          >
            Conversion Score
          </h1>
          <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm">
            <a
              href={audit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              {audit.url}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            Audited on{" "}
            {new Date(audit.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </motion.div>

        {/* Category Cards */}
        <motion.div
          ref={categoriesRef}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          {categoryEntries.map(([key, cat], i) => {
            const barColor =
              cat.score >= 80
                ? "bg-emerald-500"
                : cat.score >= 60
                ? "bg-amber-500"
                : "bg-red-500"

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">{categoryLabels[key] ?? key}</h3>
                  <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-cal-sans)" }}>
                    {cat.score}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className={`h-full ${barColor} rounded-full`}
                    initial={{ width: 0 }}
                    animate={categoriesInView ? { width: `${cat.score}%` } : { width: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{cat.insight}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Suggested Fixes */}
        {sortedFixes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-white mb-5">Suggested Fixes</h2>
            <div className="space-y-5">
              {sortedFixes.map((fix, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  className="border border-zinc-800 rounded-xl p-5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        priorityConfig[fix.priority] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"
                      }`}
                    >
                      {fix.priority}
                    </span>
                    <h3 className="text-sm font-semibold text-white">{fix.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{fix.problem}</p>
                  <div className="pl-4 border-l-2 border-emerald-500/40 bg-zinc-800/50 rounded-r-lg p-3">
                    <p className="text-sm text-zinc-300">{fix.fix}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Re-audit Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 rounded-full px-8 bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Re-audit this URL
          </Button>
        </div>
      </div>
    </div>
  )
}
