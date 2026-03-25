import type React from "react"
import type { Metadata } from "next"
import { Manrope, DM_Sans, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-cal-sans",
  weight: ["600", "700"],
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AuditMyLanding - AI Landing Page Analyzer",
  description: "Paste any URL and get an AI-powered conversion score out of 100 with actionable fixes.",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.variable} ${dmSans.variable} ${inter.variable} font-sans antialiased`}>
        <div className="noise-overlay" aria-hidden="true" />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
