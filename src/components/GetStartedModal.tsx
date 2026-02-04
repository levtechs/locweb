"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCompanyName } from "@/lib/config"

export default function GetStartedModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const companyName = getCompanyName()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const extractSlugFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split("/").filter(Boolean)
      
      if (pathParts[0] === "web" && pathParts[1]) {
        return decodeURIComponent(pathParts[1])
      }
      return null
    } catch {
      if (url.startsWith("/web/")) {
        return decodeURIComponent(url.replace("/web/", ""))
      }
      return url.trim() || null
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const slug = extractSlugFromUrl(websiteUrl)

    if (!slug) {
      setError("Please enter a valid website link or business name")
      setIsLoading(false)
      return
    }

    const encodedSlug = encodeURIComponent(slug)
    router.push(`/buy?bus=${encodedSlug}`)
  }

  const handleClose = () => {
    setIsOpen(false)
    setWebsiteUrl("")
    setError("")
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Get Started
      </button>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={handleClose}
      >
        <div
          className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transition-transform duration-200 ${
            isOpen ? "scale-100" : "scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Enter Your Website</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste the link for the website we curated for you
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder={`https://${companyName.toLowerCase().replace(/\s+/g, '')}.com/web/business-name`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none mb-4 text-gray-900 placeholder-gray-400"
              autoFocus
            />
            
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Continue to Purchase"}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
