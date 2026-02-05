import { Metadata } from "next"
import fs from "fs"
import path from "path"
import dns from "dns/promises"
import BuyContent from "./BuyContent"

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
    return false
  } catch (error: any) {
    if (error.code === "ENOTFOUND") {
      return true
    }
    return false
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

  const shortName = cleanName
    .replace(/(restaurant|cafe|bar|grill|pizzeria|bakery|deli|pub|eatery|kitchen|diner|bistro)$/, "")

  const ideas: string[] = [
    `${cleanName}.com`,
    shortName !== cleanName ? `${shortName}.com` : null,
  ].filter(Boolean) as string[]

  if (cleanType) {
    if (shortName === cleanName) {
      ideas.push(`${cleanName}${cleanType}.com`)
      ideas.push(`the${cleanName}${cleanType}.com`)
    } else {
      ideas.push(`${shortName}${cleanType}.com`)
    }
  }

  if (cleanCity) {
    ideas.push(`${cleanName}${cleanCity}.com`)
    ideas.push(`${shortName}${cleanCity}.com`)
    ideas.push(`${cleanName}in${cleanCity}.com`)
  }

  if (cleanStreet && cleanStreet.length > 3 && cleanStreet.length < 12) {
    ideas.push(`${shortName}${cleanStreet}.com`)
  }

  ideas.push(`visit${shortName}.com`)

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

  const uniqueIdeas = Array.from(new Set(ideas))
  const results: { domain: string; available: boolean }[] = []

  for (const domain of uniqueIdeas) {
    const available = await checkDomainAvailability(domain)
    results.push({ domain, available })
    if (results.filter((r) => r.available).length >= 3) {
      break
    }
  }

  results.sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1
    return 0
  })

  return results
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ bus?: string }> }): Promise<Metadata> {
  const { bus } = await searchParams
  const businessName = bus ? decodeURIComponent(bus).replace(/-/g, " ").replace(/\+/g, " ") : "this business"

  return {
    title: `Get a Professional Website - ${businessName}`,
    description: `Upgrade your free demo website to a professional custom domain setup`,
  }
}

export default async function BuyPage({ searchParams }: { searchParams: Promise<{ bus?: string }> }) {
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

  let city = ""
  let street = ""

  if (businessData?.address_components) {
    const comps = (businessData.address_components as { long_name: string; types: string[] }[])
    const cityComp = comps.find((c) => c.types.includes("locality"))
    if (cityComp) city = cityComp.long_name

    const streetComp = comps.find((c) => c.types.includes("route"))
    if (streetComp) {
      street = streetComp.long_name.split(" ").slice(0, 2).join(" ").replace(/[^a-zA-Z0-9\s]/g, "")
    }
  } else if (businessAddress) {
    const parts = businessAddress.split(",")
    if (parts.length >= 2) {
      city = parts[parts.length - 3]?.trim() || parts[parts.length - 2]?.trim() || ""
      street = parts[0]?.replace(/[0-9]/g, "").trim() || ""
      street = street.split(" ").slice(0, 2).join(" ").replace(/[^a-zA-Z0-9]/g, "")
    }
  }

  const types = (businessData?.types as string[])?.[0] || ""

  const domainResults = await generateDomainIdeasWithAvailability(businessName, city, street, types)

  return (
    <BuyContent
      businessName={businessName}
      slug={slug}
      businessAddress={businessAddress}
      businessPhone={businessPhone}
      businessRating={businessRating}
      businessReviews={businessReviews}
      photoCount={photoCount}
      domainResults={domainResults}
    />
  )
}
