# LocWeb

AI-generated professional websites for local businesses, with an option to upgrade to a custom domain.

**Live Site**: [https://locweb.vercel.app](https://locweb.vercel.app)

---

## What It Does

LocWeb is a dual-sided platform that:

1. **Auto-discovers local businesses** without websites using Google Maps API
2. **Generates professional demo websites** using AI agents with real business data (photos, reviews, hours)
3. **Hosts demo sites for free** at `locweb.vercel.app/web/[business-name]`
4. **Converts demos to paid sites** with custom domains ($45 setup + $5/month)

### Business Model

- **Free Demo**: AI-generated landing page hosted on LocWeb subdomain
- **Paid Upgrade**: Custom domain, hosting, and ongoing maintenance

---

## Tech Stack

### Frontend (Next.js 16)
- **Framework**: Next.js 16.1.1 + React 19.2.3 + TypeScript 5
- **Styling**: Tailwind CSS 4
- **Payments**: Stripe (Embedded Checkout + Customer Portal)
- **Deployment**: Vercel

### Backend (Python 3.14)
- **Business Discovery**: Google Places API
- **AI Generation**: OpenCode AI agents (minimax-m2.1-free model)
- **Parallel Processing**: Multi-threaded website generation
- **Git Automation**: Auto-commit and push new websites

---

## Project Structure

```
locweb/
├── src/                          # Next.js frontend
│   ├── app/                      # App Router pages
│   │   ├── page.tsx             # Landing page (marketing)
│   │   ├── buy/page.tsx         # Checkout flow with domain suggestions
│   │   ├── buy/success/page.tsx # Post-payment success
│   │   ├── buy/cancel/page.tsx  # Cancellation page
│   │   ├── web/[slug]/page.tsx  # Business demo websites (iframe)
│   │   ├── master/page.tsx      # Directory of all websites
│   │   ├── api/checkout/route.ts # Stripe checkout session
│   │   ├── api/portal/route.ts  # Stripe customer portal
│   │   └── legal pages/         # Terms, Privacy, Refund Policy
│   ├── components/
│   │   └── GetStartedModal.tsx  # Website claim modal
│   └── lib/
│       └── config.ts            # App configuration
├── public/
│   ├── businesses/              # Generated websites (git-tracked)
│   │   └── [business-slug]/
│   │       ├── index.html       # AI-generated website
│   │       ├── data.json        # Business metadata
│   │       └── photos/          # Downloaded images
│   └── stats.json               # Search progress tracking
├── python_api/                  # Business discovery & generation
│   ├── main.py                  # CLI orchestration tool
│   ├── generate_website.py      # AI website generation
│   ├── maps_client.py           # Google Maps API client
│   ├── area_generator.py        # ZIP code-based area discovery
│   ├── template/
│   │   ├── index.html           # Base HTML template
│   │   └── agents.md            # AI agent instructions
│   └── venv/                    # Python virtual environment
├── .env.example                 # Environment template
├── next.config.ts               # Next.js config
└── package.json                 # Dependencies
```

---

## Features

### Frontend Features

- **Landing Page**: Marketing site with pricing, features, and recent work showcase
- **Demo Website Viewer**: Iframe-based preview with "Claim Your Site" watermark
- **Domain Suggestion Engine**: Real-time DNS availability checking with AI-generated suggestions
- **Stripe Checkout**: Embedded checkout with $45 setup fee + $5/month subscription
- **Customer Portal**: Self-service billing management
- **Mobile Preview**: iPhone frame visualization of websites
- **Master Directory**: Admin view of all generated websites

### Python API Features

- **Automated Discovery**: Searches 62 US cities for businesses without websites
- **Parallel Generation**: Configurable number of AI agents (default: 3 concurrent)
- **Smart Filtering**: Targets businesses with photos but no existing website
- **Photo Management**: Downloads up to 5 photos per business locally
- **Git Workflow**: Auto-commits new websites with descriptive messages
- **Deduplication**: Prevents processing the same business twice

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.14+
- Google Maps API key
- OpenCode API key
- Stripe account (for payments)

### Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values:
# - STRIPE_SECRET_KEY
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - STRIPE_SETUP_FEE_PRICE_ID
# - STRIPE_MONTHLY_PRICE_ID
# - NEXT_PUBLIC_BASE_URL

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Python API Setup

```bash
cd python_api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp ../.env.example .env

# Edit .env with your values:
# - GOOGLE_MAPS_API_KEY
# - OPENCODE_API_KEY
# - OPENCODE_HOST (default: 127.0.0.1)
# - OPENCODE_PORT (default: 4096)

# Run the CLI
python main.py
```

---

## Usage

### Generating New Websites

1. Run `python main.py` from the `python_api` directory
2. Enter the number of websites to generate (default: 6)
3. Set number of parallel agents (default: 3)
4. Optionally specify a search keyword (e.g., "restaurant", "plumber")
5. Confirm to start the automated process

The script will:
- Search random US cities for businesses without websites
- Download photos and business data
- Generate websites using parallel AI agents
- Save results to `public/businesses/`
- Commit and push changes to git

### Viewing Generated Websites

After generation, websites are available at:
- **Demo**: `https://locweb.vercel.app/web/[business-slug]`
- **Buy Page**: `https://locweb.vercel.app/buy?bus=[business-slug]`

### Directory Listing

View all generated websites at: `https://locweb.vercel.app/master`

---

## Environment Variables

### Required for Frontend

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_... or sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_...) |
| `STRIPE_SETUP_FEE_PRICE_ID` | Stripe Price ID for $45 setup fee |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe Price ID for $5/month subscription |
| `NEXT_PUBLIC_BASE_URL` | Base URL of the app (e.g., http://localhost:3000) |

### Required for Python API

| Variable | Description |
|----------|-------------|
| `GOOGLE_MAPS_API_KEY` | Google Places API key |
| `OPENCODE_API_KEY` | OpenCode AI API key |
| `OPENCODE_HOST` | OpenCode server host (default: 127.0.0.1) |
| `OPENCODE_PORT` | OpenCode server port (default: 4096) |

---

## Architecture

### Website Generation Workflow

```
┌─────────────────┐
│   main.py CLI   │──┐
│ (User specifies │  │
│  goal, workers) │  │
└─────────────────┘  │
                     ▼
┌─────────────────────────────────────────────────────┐
│ PHASE 1: DISCOVERY                                  │
│ • Select random US city from 62 pre-configured      │
│ • Search Google Maps for businesses without sites   │
│ • Filter: must have photos, no existing website     │
│ • Continue until goal is met                        │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ PHASE 2: GENERATION (Parallel)                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │ Agent 1  │ │ Agent 2  │ │ Agent 3  │  ...         │
│ └────┬─────┘ └────┬─────┘ └────┬─────┘             │
│      │            │            │                    │
│      ▼            ▼            ▼                    │
│ • Download photos                                 │
│ • Generate HTML via OpenCode AI                   │
│ • Save to public/businesses/{slug}/               │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ PHASE 3: DEPLOYMENT                                 │
│ • Git commit with business names                    │
│ • Push to origin/master                             │
│ • Auto-deploy via Vercel                            │
└─────────────────────────────────────────────────────┘
```

### Demo Website Rendering

Generated websites are displayed in an isolated iframe:
- HTML content is read from `public/businesses/[slug]/index.html`
- Image paths are rewritten to absolute URLs
- A yellow watermark banner links to the buy page
- Sandbox attributes prevent style conflicts

---

## Pricing

- **Setup Fee**: $45 one-time
- **Monthly**: $5/month for hosting and maintenance
- **Refund Policy**: 30-day money-back guarantee on setup fee
