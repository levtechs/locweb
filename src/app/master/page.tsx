import Link from "next/link"
import fs from "fs"
import path from "path"

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

export default function Master() {
  const businessSlugs = getAllBusinessSlugs()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Local Business Websites
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Auto-curated websites for local businesses
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {businessSlugs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No business websites yet. Run the Python script to generate one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4">
            {businessSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/web/${encodeURIComponent(slug)}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {getBusinessName(slug)}
                  </h2>
                  <span className="text-sm text-blue-600">
                    View Website →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Local Business Websites. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
