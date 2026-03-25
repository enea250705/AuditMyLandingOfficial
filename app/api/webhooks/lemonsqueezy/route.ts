import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import crypto from "crypto"

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const digest = hmac.digest("hex")
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 15,
  pro: -1, // unlimited
  agency: -1, // unlimited
}

function getPlanFromVariant(variantName: string): string {
  const name = variantName.toLowerCase()
  if (name.includes("starter")) return "starter"
  if (name.includes("pro")) return "pro"
  if (name.includes("agency")) return "agency"
  return "free"
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("X-Signature") || ""
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || ""

    if (!secret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET is not set")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    if (!verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const eventName = event.meta?.event_name

    if (eventName === "subscription_created" || eventName === "subscription_updated") {
      const subscription = event.data?.attributes
      const userEmail = subscription?.user_email
      const variantName = subscription?.variant_name || ""
      const status = subscription?.status

      const plan = getPlanFromVariant(variantName)
      const auditsLimit = PLAN_LIMITS[plan] ?? 3

      const supabase = await createClient()

      // Find the user by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single()

      if (profileError || !profile) {
        console.error("Could not find profile for email:", userEmail)
        return NextResponse.json({ error: "Profile not found" }, { status: 404 })
      }

      // Update the user's plan
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          plan,
          audits_limit: auditsLimit,
          audits_used_this_month: 0,
          subscription_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (updateError) {
        console.error("Error updating profile:", updateError)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
