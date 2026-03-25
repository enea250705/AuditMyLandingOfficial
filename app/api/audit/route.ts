import { NextRequest, NextResponse } from "next/server"
import { anthropic } from "@/lib/anthropic"
import { createClient } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  try {
    const { url, userId } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Fetch the HTML from the URL
    let html = ""
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AuditMyLanding/1.0; +https://auditmylanding.com)",
        },
        signal: AbortSignal.timeout(15000),
      })
      html = await response.text()
    } catch (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch the page. Make sure the URL is publicly accessible." },
        { status: 422 }
      )
    }

    // Truncate HTML to first 8000 chars to stay within token limits
    const truncatedHtml = html.slice(0, 8000)

    const prompt = `You are an expert conversion rate optimization (CRO) analyst. Analyze the following landing page HTML and evaluate it across 5 key conversion categories. Be specific about what you find on the actual page.

Landing Page URL: ${url}

HTML Content (first 8000 characters):
${truncatedHtml}

Analyze each of these 5 categories and score them from 0-100:

1. **Headline** — Is the main headline clear, specific, and compelling? Does it immediately communicate the value proposition? Does it speak to the target audience's pain points?

2. **CTA (Call-to-Action)** — Are the CTAs specific, urgent, and prominent? Do they use action-oriented language? Are they positioned well? Is there a clear primary CTA?

3. **Trust Signals** — Are there testimonials, social proof, logos, guarantees, security badges, or other trust-building elements? How credible do they appear?

4. **Copy Clarity** — Is the copy concise and easy to scan? Does it focus on benefits over features? Is there unnecessary jargon? Is the value proposition clear throughout?

5. **Social Proof** — Are there reviews, ratings, user counts, case studies, or endorsements? How specific and credible is the social proof?

Calculate an overall score as the weighted average (headline 20%, CTA 25%, trust signals 20%, copy clarity 20%, social proof 15%).

Also identify the top 3-5 most impactful fixes, ranked by priority (Critical, High, Medium).

Respond ONLY with valid JSON in this exact format, no other text:
{
  "overallScore": 74,
  "categories": {
    "headline": { "score": 80, "insight": "Specific observation about the headline found on the page..." },
    "cta": { "score": 65, "insight": "Specific observation about the CTAs found on the page..." },
    "trustSignals": { "score": 70, "insight": "Specific observation about trust signals found on the page..." },
    "copyClarity": { "score": 75, "insight": "Specific observation about the copy clarity on the page..." },
    "socialProof": { "score": 60, "insight": "Specific observation about social proof found on the page..." }
  },
  "fixes": [
    {
      "title": "Short descriptive title of the fix",
      "priority": "Critical",
      "problem": "What exactly is wrong and why it hurts conversions",
      "fix": "The specific action to take to fix this issue"
    }
  ]
}`

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude")
    }

    let result
    try {
      result = JSON.parse(content.text)
    } catch {
      // Try to extract JSON from the response if it has extra text
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Failed to parse Claude response as JSON")
      }
    }

    // Store the result in Supabase
    if (userId) {
      const supabase = await createClient()
      const { data: audit, error } = await supabase
        .from("audits")
        .insert({
          user_id: userId,
          url,
          score: result.overallScore,
          result,
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase insert error:", error)
      } else {
        return NextResponse.json({ ...result, id: audit.id })
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Audit error:", error)
    return NextResponse.json(
      { error: "Failed to analyze the page. Please try again." },
      { status: 500 }
    )
  }
}
