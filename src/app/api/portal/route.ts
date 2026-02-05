import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, customerId, returnUrl } = body

    let session: Stripe.BillingPortal.Session | null = null

    if (sessionId) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
      
      if (typeof checkoutSession.customer !== "string") {
        return NextResponse.json(
          { error: "Could not find customer for this session" },
          { status: 400 }
        )
      }
      
      session = await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer,
        return_url: returnUrl || process.env.NEXT_PUBLIC_BASE_URL,
      })
    } else if (customerId) {
      session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || process.env.NEXT_PUBLIC_BASE_URL,
      })
    } else {
      return NextResponse.json(
        { error: "sessionId or customerId is required" },
        { status: 400 }
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe portal error:", error)
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    )
  }
}
