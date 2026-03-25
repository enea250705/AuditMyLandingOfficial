"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { CreditCard, Zap, AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase"

type Profile = {
  plan: string
  audits_used_this_month: number
  audits_limit: number
  email: string
}

const planColors: Record<string, string> = {
  free: "text-zinc-400",
  starter: "text-blue-400",
  pro: "text-emerald-400",
  agency: "text-purple-400",
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login")
        return
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("plan, audits_used_this_month, audits_limit, email")
        .eq("id", data.user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      } else {
        // Fallback from auth user
        setProfile({
          plan: "free",
          audits_used_this_month: 0,
          audits_limit: 3,
          email: data.user.email || "",
        })
      }
      setLoading(false)
    })
  }, [router])

  async function handleDeleteAccount() {
    setDeleting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Delete user data from profiles
    await supabase.from("profiles").delete().eq("id", user.id)
    await supabase.from("audits").delete().eq("user_id", user.id)

    // Sign out (account deletion via admin API would be needed in production)
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/3" />
          <div className="h-48 bg-zinc-800 rounded-2xl" />
          <div className="h-32 bg-zinc-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  const planName = profile?.plan
    ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)
    : "Free"
  const planColor = planColors[profile?.plan || "free"] || "text-zinc-400"
  const auditsUsed = profile?.audits_used_this_month || 0
  const auditsLimit = profile?.audits_limit || 3
  const isUnlimited = auditsLimit === -1

  const usagePercent = isUnlimited ? 20 : Math.min(100, (auditsUsed / auditsLimit) * 100)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: "var(--font-cal-sans)" }}
        >
          Settings
        </h1>
        <p className="text-zinc-400 text-sm">Manage your account and subscription.</p>
      </div>

      <div className="space-y-5">
        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-white">Current Plan</h2>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div>
              <p className={`text-2xl font-bold ${planColor}`} style={{ fontFamily: "var(--font-cal-sans)" }}>
                {planName}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                {profile?.email}
              </p>
            </div>
            {profile?.plan !== "agency" && (
              <Button
                className="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-5"
                size="sm"
                onClick={() => router.push("/#pricing")}
              >
                Upgrade
              </Button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-zinc-400">Audits this month</span>
              <span className="text-zinc-300 font-medium">
                {auditsUsed} / {isUnlimited ? "∞" : auditsLimit}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {!isUnlimited && auditsUsed >= auditsLimit && (
              <p className="text-xs text-amber-400 mt-2">
                You&apos;ve reached your monthly limit. Upgrade to continue auditing.
              </p>
            )}
          </div>
        </motion.div>

        {/* Billing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-white">Billing</h2>
          </div>

          <p className="text-sm text-zinc-400 mb-4">
            Manage your subscription, payment methods, and invoices through the billing portal.
          </p>

          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 bg-transparent rounded-xl"
            asChild
          >
            <a href="#" target="_blank" rel="noopener noreferrer">
              Manage Subscription
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-zinc-900 border border-red-500/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
          </div>

          <p className="text-sm text-zinc-400 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 bg-transparent rounded-xl"
              >
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  This will permanently delete your account and all your audit history. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white border-0"
                >
                  {deleting ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  )
}
