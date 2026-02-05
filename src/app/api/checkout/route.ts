import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { businessConfig } from "@/lib/config"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessSlug, customerEmail, selectedDomain } = body

    const setupFeePriceId = businessConfig.pricing.upfront.stripePriceId
    const monthlyPriceId = businessConfig.pricing.monthly.stripePriceId

    if (!setupFeePriceId || !monthlyPriceId) {
      return NextResponse.json(
        { error: "Stripe price IDs not configured" },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: setupFeePriceId,
          quantity: 1,
        },
        {
          price: monthlyPriceId,
          quantity: 1,
        },
      ],
      ...(customerEmail && { customer_email: customerEmail }),
      subscription_data: {
        metadata: {
          businessSlug: businessSlug || "",
          selectedDomain: selectedDomain || "",
        },
      },
      metadata: {
        businessSlug: businessSlug || "",
        selectedDomain: selectedDomain || "",
      },
      return_url: `${baseUrl}/buy/success?session_id={CHECKOUT_SESSION_ID}`,
    })

    return NextResponse.json({ clientSecret: session.client_secret, sessionId: session.id })
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
