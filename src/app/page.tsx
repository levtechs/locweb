import Link from "next/link"
import fs from "fs"
import path from "path"
import { getUpfrontPrice, getMonthlyPrice, getContactEmail, getCompanyName } from "@/lib/config"
import GetStartedModal from "@/components/GetStartedModal"

const BUSINESSES_DIR = path.join(process.cwd(), "public", "businesses")

function getAllBusinessSlugs(): string[] {
  if (!fs.existsSync(BUSINESSES_DIR)) {
    return []
  }
  
  try {
    const slugs = new Set<string>()
    const entries = fs.readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dataFile = path.join(BUSINESSES_DIR, entry.name, "data.json")
        if (fs.existsSync(dataFile)) {
          slugs.add(entry.name)
        }
      }
    }
    
    return Array.from(slugs).sort()
  } catch {
    return []
  }
}

function getBusinessName(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, " ").replace(/\+/g, " ")
}

export default function Home() {
  const businessSlugs = getAllBusinessSlugs()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt="LocWeb" className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-gray-900">
                LocWeb
              </h1>
            </div>
            <nav className="flex gap-6">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href={`mailto:${getContactEmail()}`} className="text-gray-600 hover:text-gray-900">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Professional Websites for Local Businesses
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              We create beautiful, custom-curated landing pages for local businesses at no cost. 
              Each website showcases your photos, reviews, and business information to help 
              customers find and choose you.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="#contact"
                className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Get Your Free Website
              </a>
              <a
                href="#how-it-works"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  We Find Your Business
                </h4>
                <p className="text-gray-600">
                  We search for local businesses without websites and create custom pages 
                  using your Google Business profile photos and reviews.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  We Curate Your Site
                </h4>
                <p className="text-gray-600">
                  Our team creates a beautiful, mobile-friendly landing page showcasing 
                  what makes your business special.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  You Grow Your Business
                </h4>
                <p className="text-gray-600">
                  Share your new website with customers. Help them find you, learn about 
                  your business, and get in touch easily.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              What's Included
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                "Professional design tailored to your brand",
                "Mobile-optimized for all devices",
                "Photo gallery with your business images",
                "Customer reviews and ratings",
                "Business hours and location",
                "Click-to-call phone button",
                "Google Maps integration",
                "Fast loading speeds",
                "Easy to share and promote"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-gray-600 text-center mb-12">
              We believe every local business deserves a professional online presence.
            </p>
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  Starter Package
                </h4>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">{getUpfrontPrice()}</span>
                  <span className="text-gray-500"> one-time</span>
                </div>
                <p className="text-gray-600 mb-6">
                  plus <span className="font-semibold">{getMonthlyPrice()}</span> to keep it running. 
                  No long-term contracts.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Custom-designed landing page",
                    "Your own domain name",
                    "Photo gallery & reviews",
                    "Mobile-optimized",
                    "Google Maps integration",
                    "Ongoing updates & support"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <GetStartedModal />
              </div>
            </div>
            <p className="text-center text-gray-500 mt-8 text-sm">
              Optional add-ons: Online menu, more details, embed map, and more.
            </p>
          </div>
        </section>

        {businessSlugs.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Recent Websites
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {businessSlugs.slice(0, 6).map((slug) => (
                  <Link
                    key={slug}
                    href={`/web/${encodeURIComponent(slug)}`}
                    className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-gray-900">
                      {getBusinessName(slug)}
                    </h4>
                    <span className="text-sm text-blue-600">
                      View Website →
                    </span>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  href="/master"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Websites →
                </Link>
              </div>
            </div>
          </section>
        )}

        <section id="contact" className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Grow Your Business Online?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Get a professional website that helps customers find and choose your business. 
              Contact us today to get started.
            </p>
            <a
              href={`mailto:${getContactEmail()}`}
              className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} LocWeb. All rights reserved.
            </p>
              <div className="flex gap-6 text-sm text-gray-500">
                <a href="/terms" className="hover:text-gray-900">Terms of Service</a>
                <a href="/privacy" className="hover:text-gray-900">Privacy Policy</a>
                <a href="/refund-policy" className="hover:text-gray-900">Refund Policy</a>
                <a href={`mailto:${getContactEmail()}`} className="hover:text-gray-900">Contact</a>
              </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
