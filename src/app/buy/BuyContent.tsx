"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { getUpfrontPrice, getMonthlyPrice, getCompanyName } from "@/lib/config"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface BuyContentProps {
  businessName: string
  slug: string
  businessAddress: string
  businessPhone: string
  businessRating?: number
  businessReviews?: number
  photoCount: number
  domainResults: { domain: string; available: boolean }[]
}

export default function BuyContent({
  businessName,
  slug,
  businessAddress,
  businessPhone,
  businessRating,
  businessReviews,
  photoCount,
  domainResults,
}: BuyContentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>("")
  const [customDomain, setCustomDomain] = useState<string>("")
  const searchParams = useSearchParams()
  const canceled = searchParams.get("canceled")

  useEffect(() => {
    const firstAvailable = domainResults.find(r => r.available)?.domain || ""
    if (firstAvailable) {
      setSelectedDomain(firstAvailable)
    }
  }, [domainResults])

  const companyName = getCompanyName()
  const upfrontPrice = getUpfrontPrice()
  const monthlyPrice = getMonthlyPrice()

  const displayDomain = selectedDomain === "other" ? (customDomain || "other") : selectedDomain

  useEffect(() => {
    if (!selectedDomain) return
    
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug: slug,
        customerEmail: "",
        selectedDomain: displayDomain,
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => console.error("Error fetching checkout session:", err))
  }, [slug, selectedDomain, displayDomain])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white font-sans text-gray-900">
      {canceled && (
        <div className="bg-orange-100 border-b border-orange-200 px-6 py-4">
          <p className="text-center text-orange-800">
            Checkout was canceled. No charges were made.
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Ready to Go Live, <span className="text-amber-600">{businessName}?</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your free demo website is ready. Claim it now to start attracting more customers with a professional online presence.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Why {businessName} Needs This Website</h2>
              <div className="space-y-6">
                {businessRating && businessRating >= 4.0 && (
                  <div className="flex gap-4 items-start">
                    <div className="bg-yellow-100 p-3 rounded-full shrink-0">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Showcase Your {businessRating}-Star Rating</h3>
                      <p className="text-gray-600">
                        You&apos;ve worked hard for your reputation. This website highlights your {businessReviews} reviews so new customers trust you instantly.
                      </p>
                    </div>
                  </div>
                )}

                {photoCount > 0 && (
                  <div className="flex gap-4 items-start">
                    <div className="bg-blue-100 p-3 rounded-full shrink-0">
                      <span className="text-2xl">📸</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Display Your Work Beautifully</h3>
                      <p className="text-gray-600">Customers eat with their eyes first. We&apos;ve curated a gallery of your best photos to make a great first impression.</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 items-start">
                  <div className="bg-green-100 p-3 rounded-full shrink-0">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Get Found on Google</h3>
                    <p className="text-gray-600">A professional website helps you rank higher in local search results, bringing more foot traffic to your door.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-purple-100 p-3 rounded-full shrink-0">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Mobile-Optimized</h3>
                    <p className="text-gray-600">Over 60% of searches happen on phones. Your new site looks perfect on any device.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Everything You Need to Succeed</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {[
                  "Custom Domain (yourname.com)",
                  "SSL Security Certificate",
                  "Fast & Reliable Hosting",
                  "Mobile Responsive Design",
                  "SEO Optimization",
                  "Monthly Maintenance",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-[320px] h-[640px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden mb-6">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-xl z-20"></div>
              <div className="w-full h-full bg-white overflow-hidden relative">
                <iframe
                  src={`/businesses/${slug}/index.html`}
                  className="absolute top-0 left-0 border-none bg-white origin-top-left"
                  title="Mobile Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  style={{
                    width: "414px",
                    height: "896px",
                    transform: "scale(0.734)",
                  }}
                />
              </div>
            </div>

            <Link
              href={`/web/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors"
            >
              View Full Desktop Site <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Your Digital Real Estate</h2>
            <p className="text-gray-600">Select one of your personalized domains or enter your own.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {domainResults.map((item, i) => (
                <label
                  key={i}
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                    selectedDomain === item.domain ? "bg-amber-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="domain"
                      value={item.domain}
                      checked={selectedDomain === item.domain}
                      onChange={(e) => {
                        setSelectedDomain(e.target.value)
                        setCustomDomain("")
                      }}
                      className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                    />
                    <div className={`font-mono text-lg ${item.available ? "text-gray-800" : "text-gray-400 line-through"}`}>
                      {item.domain}
                    </div>
                  </div>
                  {item.available ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Taken
                    </span>
                  )}
                </label>
              ))}
              <label
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                  selectedDomain === "other" ? "bg-amber-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="domain"
                    value="other"
                    checked={selectedDomain === "other"}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="other.com"
                    value={customDomain}
                    onChange={(e) => {
                      setCustomDomain(e.target.value)
                      setSelectedDomain("other")
                    }}
                    className="font-mono text-lg border-b border-gray-300 focus:border-amber-500 focus:outline-none bg-transparent placeholder-gray-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </label>
            </div>
            <div className="bg-amber-50 p-4 text-center text-sm text-gray-600 border-t border-amber-100">
              <span className="font-medium">Note:</span> We&apos;ll verify domain availability before setting up your site.
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
            <p className="text-gray-500">Secure 256-bit SSL encrypted payment</p>
          </div>

          {clientSecret && displayDomain ? (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout className="w-full" />
            </EmbeddedCheckoutProvider>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
              <p className="text-gray-500">
                {!selectedDomain
                  ? "Select a domain above to continue"
                  : "Loading checkout..."}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-12 text-center text-gray-500">
          <p className="mb-4">{companyName} - Dedicated to helping local businesses grow.</p>
          <div className="flex justify-center gap-6 text-sm mb-4">
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-gray-900">Refund Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
