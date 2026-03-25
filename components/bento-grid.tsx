"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { AlertCircle, MousePointerClick, ShieldOff } from "lucide-react"

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const painPoints = [
  {
    icon: AlertCircle,
    title: "Vague headlines that confuse",
    description:
      "Visitors land on your page and can't instantly understand what you offer. Confusing headlines kill conversions before the user even scrolls.",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    icon: MousePointerClick,
    title: "Weak CTAs that don't convert",
    description:
      "Generic \"Learn More\" or \"Submit\" buttons leave money on the table. Your call-to-action needs to be specific, urgent, and compelling.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: ShieldOff,
    title: "No trust signals",
    description:
      "Without social proof, testimonials, or trust badges, visitors hesitate to buy. You need to earn trust before asking for the conversion.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
]

const steps = [
  {
    number: "01",
    title: "Paste Your URL",
    description: "Drop in any landing page URL — whether it's built with Webflow, Framer, WordPress, or anything else.",
    detail: "Works with any publicly accessible URL",
  },
  {
    number: "02",
    title: "AI Reads Everything",
    description:
      "Claude reads your headline, CTA, copy, trust signals, and social proof — the five pillars of conversion.",
    detail: "Powered by Claude Opus",
  },
  {
    number: "03",
    title: "Get Your Score",
    description:
      "Receive a score out of 100 with specific, actionable fixes ranked by priority so you know exactly what to fix first.",
    detail: "Score + fixes in under 30 seconds",
  },
]

export function BentoGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const stepsRef = useRef(null)
  const stepsInView = useInView(stepsRef, { once: true, margin: "-100px" })

  return (
    <>
      {/* Pain Points Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-instrument-sans)" }}
            >
              Why most landing pages fail
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Three conversion killers that plague 90% of landing pages — and why most founders never notice them.
            </p>
          </motion.div>

          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {painPoints.map((point) => (
              <motion.div
                key={point.title}
                variants={itemVariants}
                className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
              >
                <div className={`p-2 rounded-lg ${point.bg} w-fit mb-4`}>
                  <point.icon className={`w-5 h-5 ${point.color}`} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{point.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{point.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-instrument-sans)" }}
            >
              How it works
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              From URL to actionable insights in under 30 seconds.
            </p>
          </motion.div>

          <motion.div
            ref={stepsRef}
            variants={containerVariants}
            initial="hidden"
            animate={stepsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span
                    className="text-4xl font-bold text-zinc-800 leading-none select-none"
                    style={{ fontFamily: "var(--font-cal-sans)" }}
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">{step.description}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-zinc-400">{step.detail}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
