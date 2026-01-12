import { Metadata } from "next"
import fs from "fs"
import path from "path"

interface BusinessPageProps {
  params: Promise<{ slug: string }>
}

const CODE_FILE = path.join(process.cwd(), "src", "lib", "code.json")

export async function generateStaticParams() {
  if (!fs.existsSync(CODE_FILE)) {
    return []
  }
  
  try {
    const codeData = JSON.parse(fs.readFileSync(CODE_FILE, "utf-8"))
    const slugs = new Set<string>()
    
    for (const key of Object.keys(codeData)) {
      // Look for either .html or .page files
      if (key.endsWith(".html") || key.endsWith(".page")) {
        const slug = key.replace(/\.(html|page)$/, "")
        slugs.add(slug)
      }
    }
    
    return Array.from(slugs).map((slug) => ({ slug }))
  } catch {
    return []
  }
}

function readCodeData(): Record<string, string> {
  if (!fs.existsSync(CODE_FILE)) {
    return {}
  }
  try {
    return JSON.parse(fs.readFileSync(CODE_FILE, "utf-8"))
  } catch {
    return {}
  }
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
  const codeData = readCodeData()
  
  // Try to get HTML content first (new format)
  let htmlContent = codeData[`${decodedSlug}.html`]
  let isRawHtml = true
  
  // Fallback to old React format if needed
  if (!htmlContent) {
    const pageCode = codeData[`${decodedSlug}.page`]
    if (pageCode) {
      isRawHtml = false
      // Extract HTML from React code (legacy format)
      const startMarker = 'export const html = \\`'
      const startIdx = pageCode.indexOf(startMarker)
      
      if (startIdx !== -1) {
        const contentStart = startIdx + startMarker.length
        const endPattern = /\n\\`/g
        let match
        let lastMatchIdx = -1
        
        while ((match = endPattern.exec(pageCode)) !== null) {
          lastMatchIdx = match.index
        }
        
        if (lastMatchIdx > contentStart) {
          htmlContent = pageCode.substring(contentStart, lastMatchIdx)
          
          // Extract only body content
          const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
          if (bodyMatch) {
            htmlContent = bodyMatch[1]
          } else {
            const bodyContentMatch = htmlContent.match(/<body[^>]*>([\s\S]*)/i)
            if (bodyContentMatch) {
              htmlContent = bodyContentMatch[1]
            }
          }
          
          // Unescape
          htmlContent = htmlContent.replace(/\\\\`/g, '`')
          htmlContent = htmlContent.replace(/\\`/g, '`')
          htmlContent = htmlContent.replace(/\\n/g, '\n')
          htmlContent = htmlContent.replace(/\\"/g, '"')
          htmlContent = htmlContent.replace(/\\\\/g, '\\')
        }
      }
    }
  }
  
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
    <>
      {watermark}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </>
  )
}