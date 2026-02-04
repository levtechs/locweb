import { Metadata } from "next"
import fs from "fs"
import path from "path"
import dns from "dns/promises"

interface BuyPageProps {
  searchParams: Promise<{ bus?: string }>
}

const BUSINESSES_DIR = path.join(process.cwd(), "public", "businesses")

function readBusinessData(slug: string): Record<string, unknown> | null {
  const businessDir = path.join(BUSINESSES_DIR, slug)
  const dataFile = path.join(businessDir, "data.json")
  
  if (fs.existsSync(dataFile)) {
    try {
      const content = fs.readFileSync(dataFile, "utf-8")
      return JSON.parse(content)
    } catch {
      return null
    }
  }
  return null
}

async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    await dns.resolve(domain)
    return false // Domain exists (resolves to IP)
  } catch (error: any) {
    if (error.code === 'ENOTFOUND') {
      return true // Domain does not exist (likely available)
    }
    return false // Other error, assume unavailable safely
  }
}

async function generateDomainIdeasWithAvailability(
  name: string, 
  city: string, 
  street: string = "", 
  type: string = ""
): Promise<{ domain: string; available: boolean }[]> {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "")
  const cleanCity = city.toLowerCase().replace(/[^a-z0-9]/g, "")
  const cleanStreet = street.toLowerCase().replace(/[^a-z0-9]/g, "")
  const cleanType = type.toLowerCase().replace(/[^a-z0-9]/g, "")

  // Shortened name variants - strip common suffixes for cleaner domains
  const shortName = cleanName
    .replace(/(restaurant|cafe|bar|grill|pizzeria|bakery|deli|pub|eatery|kitchen|diner|bistro)$/, "")
  
  const ideas: string[] = [
    `${cleanName}.com`,
    shortName !== cleanName ? `${shortName}.com` : null,
  ].filter(Boolean) as string[]

  // Add type-specific variations
  if (cleanType) {
    if (shortName === cleanName) {
      ideas.push(`${cleanName}${cleanType}.com`)
      ideas.push(`the${cleanName}${cleanType}.com`)
    } else {
      ideas.push(`${shortName}${cleanType}.com`)
    }
  }
  
  // Add city variations
  if (cleanCity) {
    ideas.push(`${cleanName}${cleanCity}.com`)
    ideas.push(`${shortName}${cleanCity}.com`)
    ideas.push(`${cleanName}in${cleanCity}.com`)
  }
  
  // Add street variations
  if (cleanStreet && cleanStreet.length > 3 && cleanStreet.length < 12) {
    ideas.push(`${shortName}${cleanStreet}.com`)
  }
  
  // Add "visit" variant
  ideas.push(`visit${shortName}.com`)

  // Generate more creative variations if needed
  const creativeIdeas = [
    `${shortName}spot.com`,
    `${shortName}place.com`,
    `${shortName}house.com`,
    `${shortName}spot${cleanCity}.com`,
    `${shortName}go.com`,
    `${shortName}now.com`,
    `${cleanName}now.com`,
    `${shortName}hub.com`,
    `${shortName}central.com`,
  ]
  
  ideas.push(...creativeIdeas)

  // Check availability and return up to 3 available
  const uniqueIdeas = Array.from(new Set(ideas))
  const results: { domain: string; available: boolean }[] = []
  
  for (const domain of uniqueIdeas) {
    const available = await checkDomainAvailability(domain)
    results.push({ domain, available })
    // If we have 3 available, we're done
    if (results.filter(r => r.available).length >= 3) {
      break
    }
  }
  
  // Sort: available first, then by relevance
  results.sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1
    return 0
  })
  
  return results
}

export async function generateMetadata({ searchParams }: BuyPageProps): Promise<Metadata> {
  const { bus } = await searchParams
  const businessName = bus ? decodeURIComponent(bus).replace(/-/g, " ").replace(/\+/g, " ") : "this business"
  
  return {
    title: `Get a Professional Website - ${businessName}`,
    description: `Upgrade your free demo website to a professional custom domain setup`,
  }
}

export default async function BuyPage({ searchParams }: BuyPageProps) {
  const { bus } = await searchParams
  const slug = bus || ""
  const businessName = slug ? decodeURIComponent(slug).replace(/-/g, " ").replace(/\+/g, " ") : ""
  
  const businessData = slug ? readBusinessData(slug) : null
  const businessAddress = (businessData?.vicinity || businessData?.formatted_address) as string || ""
  const businessPhone = (businessData?.formatted_phone_number || businessData?.international_phone_number) as string || ""
  const businessRating = businessData?.rating as number | undefined
  const businessReviews = businessData?.user_ratings_total as number | undefined
  const businessPhotos = businessData?.photos as unknown[] | undefined
  const photoCount = businessPhotos?.length || 0

  // Domain Logic - extract city and street from address
  let city = ""
  let street = ""
  
  if (businessData?.address_components) {
     const comps = businessData.address_components as { long_name: string, types: string[] }[]
     const cityComp = comps.find(c => c.types.includes('locality'))
     if (cityComp) city = cityComp.long_name
     
     // Try to get street name
     const streetComp = comps.find(c => c.types.includes('route'))
     if (streetComp) {
       // Extract street name (e.g., "Main Street" from "Main Street")
       street = streetComp.long_name.split(' ').slice(0, 2).join(' ').replace(/[^a-zA-Z0-9\s]/g, '')
     }
  } else if (businessAddress) {
      // Fallback parse: "123 Main St, Springfield, IL 62704" -> Springfield, Main
      const parts = businessAddress.split(',')
      if (parts.length >= 2) {
         city = parts[parts.length - 3]?.trim() || parts[parts.length - 2]?.trim() || ""
         street = parts[0]?.replace(/[0-9]/g, '').trim() || ""
         street = street.split(' ').slice(0, 2).join(' ').replace(/[^a-zA-Z0-9]/g, '')
      }
  }

  const types = (businessData?.types as string[])?.[0] || ""
  
  const domainResults = await generateDomainIdeasWithAvailability(businessName, city, street, types)
  const topDomains = domainResults

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white font-sans text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Ready to Go Live, <span className="text-amber-600">{businessName}?</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your free demo website is ready. Claim it now to start attracting more customers with a professional online presence.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left Column: The Pitch */}
          <div className="space-y-8">
            
            {/* Why You Need This (Personalized) */}
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
                      <p className="text-gray-600">You've worked hard for your reputation. This website highlights your {businessReviews} reviews so new customers trust you instantly.</p>
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
                      <p className="text-gray-600">Customers eat with their eyes first. We've curated a gallery of your best photos to make a great first impression.</p>
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

            {/* What's Included */}
            <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Everything You Need to Succeed</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {[
                  "Custom Domain (yourname.com)",
                  "SSL Security Certificate",
                  "Fast & Reliable Hosting",
                  "Mobile Responsive Design",
                  "SEO Optimization",
                  "Monthly Maintenance"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Preview */}
          <div className="flex flex-col items-center">
            
            {/* Mobile Preview */}
            <div className="relative w-[320px] h-[640px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden mb-6">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-xl z-20"></div>
              {/* Scaled Iframe Container */}
              <div className="w-full h-full bg-white overflow-hidden relative">
                 <iframe 
                  src={`/businesses/${slug}/index.html`}
                  className="absolute top-0 left-0 border-none bg-white origin-top-left"
                  title="Mobile Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  style={{ 
                    width: '414px', 
                    height: '896px', // iPhone Max height
                    transform: 'scale(0.734)' // 304 / 414 ≈ 0.734
                  }} 
                />
              </div>
            </div>
            
            <a 
              href={`/web/${slug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors"
            >
              View Full Desktop Site <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>

          </div>
        </div>

        {/* Domain Selection */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Your Digital Real Estate</h2>
            <p className="text-gray-600">We generated these personalized domains based on your business name, location, and type.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {topDomains.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-red-400'}`}></div>
                    <span className={`font-mono text-lg ${item.available ? 'text-gray-800 font-semibold' : 'text-gray-400 line-through'}`}>
                      {item.domain}
                    </span>
                  </div>
                  {item.available ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Likely Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Taken
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-amber-50 p-4 text-center text-sm text-gray-600 border-t border-amber-100">
              <span className="font-medium">Tip:</span> These are personalized suggestions, but you're not limited to this list. After checkout, you can pick any domain you prefer.
            </div>
          </div>
        </div>

        {/* Pricing Card - Centered Below */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-400 relative overflow-hidden transform transition hover:scale-[1.01]">
            <div className="absolute top-0 right-0 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">LIMITED TIME OFFER</div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Simple, Transparent Pricing</h2>
              <p className="text-gray-500 mb-6">Get everything you need to launch today</p>
              
              <div className="flex justify-center items-baseline gap-2 mb-2">
                <span className="text-5xl font-extrabold text-gray-900">$45</span>
                <span className="text-xl text-gray-500 line-through decoration-red-500">$199</span>
              </div>
              <p className="text-sm font-medium text-amber-600 uppercase tracking-wide">One-time Setup Fee</p>
              <p className="text-sm text-gray-500 mt-2">+ just $5/month for hosting & maintenance</p>
            </div>

            <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg text-lg flex items-center justify-center gap-2 transition-all">
              Start Your Website Now 
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
            
            <div className="mt-6 flex justify-center gap-4 text-gray-400 opacity-70 grayscale">
              <span className="text-xs border px-2 py-1 rounded">VISA</span>
              <span className="text-xs border px-2 py-1 rounded">Mastercard</span>
              <span className="text-xs border px-2 py-1 rounded">Amex</span>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              Secure 256-bit SSL encrypted payment. 30-day money-back guarantee.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-gray-200 pt-12 text-center text-gray-500">
           <p className="mb-4">LocWeb - Dedicated to helping local businesses grow.</p>
           <a href="/" className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium hover:underline">
             &larr; Back to Home
           </a>
        </div>

      </div>
    </div>
  )
}
