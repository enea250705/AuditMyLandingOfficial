"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const avatars = [
  "/professional-headshot-1.png",
  "/professional-headshot-2.png",
  "/professional-headshot-3.png",
  "/professional-headshot-4.png",
  "/professional-headshot-5.png",
]

const textRevealVariants = {
  hidden: { y: "100%" },
  visible: (i: number) => ({
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.1,
    },
  }),
}

const categories = [
  { label: "Headline", score: 92, color: "bg-emerald-500" },
  { label: "CTA", score: 88, color: "bg-emerald-500" },
  { label: "Trust Signals", score: 95, color: "bg-emerald-500" },
  { label: "Copy Clarity", score: 78, color: "bg-amber-500" },
  { label: "Social Proof", score: 82, color: "bg-emerald-500" },
]

const barVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.3 + i * 0.1,
    },
  }),
}

function AnimatedScore() {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const target = 87
    const duration = 1800
    const step = Math.ceil(duration / target)
    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start >= target) clearInterval(timer)
    }, step)
    return () => clearInterval(timer)
  }, [isInView])

  return <span ref={ref}>{count}</span>
}

export function Hero() {
  const cardRef = useRef(null)
  const cardInView = useInView(cardRef, { once: true })

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 pointer-events-none" />

      {/* Subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-glow" />
          <span className="text-sm text-zinc-400">AI-Powered · Score out of 100</span>
        </motion.div>

        {/* Headline with text mask animation */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
          style={{ fontFamily: "var(--font-cal-sans), sans-serif" }}
        >
          <span className="block overflow-hidden">
            <motion.span className="block" variants={textRevealVariants} initial="hidden" animate="visible" custom={0}>
              Your landing page
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-zinc-500"
              variants={textRevealVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              is leaking conversions.
            </motion.span>
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Paste any URL and Claude AI analyzes your headline, CTA, trust signals, copy clarity, and social proof — then
          gives you the exact fixes to improve your score.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-64 h-12 px-4 rounded-full bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <Button
              type="submit"
              size="lg"
              className="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-white/10 w-full sm:w-auto"
            >
              Join Waitlist
            </Button>
          </form>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-12 text-base font-medium border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 bg-transparent w-full sm:w-auto"
          >
            Start Free Audit
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col items-center gap-4 mb-16"
        >
          <div className="flex items-center -space-x-3">
            {avatars.map((avatar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                className="relative"
              >
                <img
                  src={avatar || "/placeholder.svg"}
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-zinc-950 object-cover"
                />
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-zinc-500">
            Join <span className="text-zinc-300 font-medium">1,200+</span> founders already on the waitlist
          </p>
        </motion.div>

        {/* Demo Audit Card */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg mx-auto text-left"
        >
          {/* Card Header */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm text-zinc-300 font-medium">Live Demo — stripe.com</span>
          </div>

          {/* Score */}
          <div className="flex items-end gap-3 mb-2">
            <span className="text-7xl font-bold text-white leading-none" style={{ fontFamily: "var(--font-cal-sans)" }}>
              <AnimatedScore />
            </span>
            <div className="pb-2">
              <div className="text-zinc-400 text-sm">out of 100</div>
              <div className="text-zinc-500 text-xs">Conversion Score</div>
            </div>
          </div>

          {/* Category Rows */}
          <div className="space-y-3 mt-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                variants={barVariants}
                initial="hidden"
                animate={cardInView ? "visible" : "hidden"}
                custom={i}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-400">{cat.label}</span>
                  <span className="text-xs text-zinc-300 font-medium">{cat.score}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${cat.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={cardInView ? { width: `${cat.score}%` } : { width: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-zinc-800">
            <span className="text-sm text-emerald-400 font-medium">3 critical fixes found →</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
