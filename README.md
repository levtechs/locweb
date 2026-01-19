# LocWeb

Professional websites for local businesses at no cost.

## What It Does

LocWeb automatically creates free professional websites for local businesses that don't have one. The system:

1. **Searches Google Maps** for local businesses without websites
2. **Generates customized landing pages** using AI
3. **Includes business photos, reviews, hours, and contact info** from Google Business profiles
4. **Creates personalized sales emails** to pitch the websites to business owners
5. **Hosts the websites** on a Next.js platform

## Website

[https://locweb.vercel.app/](https://locweb.vercel.app/)

## Features

- Automated business discovery via Google Places API
- AI-powered website generation with Tailwind CSS
- Photo gallery from Google Maps
- Customer reviews showcase (4+ stars)
- Business hours and contact information
- Google Maps integration
- Personalized sales email generation
- Master dashboard at `/master`

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Business Discovery**: Python scripts for Google Maps scanning and AI website generation

## Project Structure

```
locweb/
├── src/                      # Next.js frontend
│   ├── app/                  # App router pages
│   │   ├── page.tsx         # Main landing page
│   │   ├── master/page.tsx  # Dashboard of all websites
│   │   └── web/[slug]/      # Dynamic business pages
│   └── lib/
│       └── code.json        # Generated HTML & emails (database)
├── python_api/              # Business discovery & generation scripts
│   ├── main.py             # CLI for scanning businesses
│   ├── generate_website.py # AI website generation orchestration
│   └── template/           # Templates for AI
└── public/                  # Static assets
```

## Getting Started

### Frontend (Next.js)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Python Scripts (Business Discovery & Generation)

```bash
cd python_api
python main.py
```

These scripts scan Google Maps for businesses without websites and use AI to generate landing pages.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:
- `GOOGLE_MAPS_API_KEY` - Google Maps Places API key
- `OPENCODE_API_KEY` - OpenCode API key for AI generation
- `OWNER_EMAIL` - Contact email for sales outreach
- `OWNER_NAME` - Owner name for email signature
- `OPENCODE_HOST` - OpenCode server host (default: 127.0.0.1)
- `OPENCODE_PORT` - OpenCode server port (default: 4096)

## License

MIT
