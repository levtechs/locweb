import { Metadata } from "next"
import fs from "fs"
import path from "path"

interface BusinessPageProps {
  params: Promise<{ slug: string }>
}

const BUSINESSES_DIR = path.join(process.cwd(), "public", "businesses")

export async function generateStaticParams() {
  if (!fs.existsSync(BUSINESSES_DIR)) {
    return []
  }
  
  try {
    const slugs = new Set<string>()
    const entries = fs.readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const indexFile = path.join(BUSINESSES_DIR, entry.name, "index.html")
        if (fs.existsSync(indexFile)) {
          slugs.add(entry.name)
        }
      }
    }
    
    return Array.from(slugs).map((slug) => ({ slug }))
  } catch {
    return []
  }
}

function readHtmlContent(slug: string): string | null {
  const businessDir = path.join(BUSINESSES_DIR, slug)
  const indexFile = path.join(businessDir, "index.html")
  
  if (fs.existsSync(indexFile)) {
    try {
      let html = fs.readFileSync(indexFile, "utf-8")
      // Rewrite relative image paths to absolute paths
      // Handle src="photos/...", href="photos/...", and url('photos/...') including complex background-image
      html = html.replace(/(src|href)=['"](photos\/[^'"]+)['"]/g, 
        (match, attr, imagePath) => {
          return `${attr}="/businesses/${slug}/${imagePath}"`
        }
      )
      // Handle background-image with url()
      html = html.replace(/url\(['"]?(photos\/[^'")\s]+)['"]?\)/g, 
        (match, imagePath) => {
          return `url('/businesses/${slug}/${imagePath}')`
        }
      )
      return html
    } catch {
      return null
    }
  }
  return null
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const businessName = decodedSlug.replace(/-/g, " ").replace(/\+/g, " ")
  
  return {
    title: businessName,
    description: `Visit ${businessName} - Local business website`,
  }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  
  // Read HTML from the business folder
  const htmlContent = readHtmlContent(decodedSlug)
  
  if (!htmlContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Website Not Found</h1>
          <p className="text-gray-600 mb-4">The website for &quot;{decodedSlug}&quot; could not be found.</p>
        </div>
      </div>
    )
  }

  // Add watermark
  const watermark = (
    <a
      href="/"
      style={{
        display: "block",
        backgroundColor: "#fbbf24",
        color: "#000",
        textAlign: "center",
        padding: "8px",
        fontSize: "14px",
        fontWeight: 500,
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        textDecoration: "none",
        cursor: "pointer"
      }}
      title="LocWeb - Professional websites for local businesses"
    >
      Free Website - Custom-Curated by LocWeb
    </a>
  )

  // Always render with watermark (both for raw HTML and extracted HTML)
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {watermark}
      <div style={{ flex: 1 }} dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  )
}