import { Metadata } from "next"
import Link from "next/link"
import { getContactEmail } from "@/lib/config"

export const metadata: Metadata = {
  title: "Cancel Subscription",
  description: "Cancel your subscription",
}

export default function CancelPage() {
  const contactEmail = getContactEmail()

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white font-sans text-gray-900 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancel Subscription or Request Refund</h1>
          <p className="text-gray-600">Email us to cancel your subscription or request a refund within 30 days</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <p className="text-gray-600 mb-4">
            Email us to cancel your subscription or request a refund.
            Include the email address you used at checkout.
          </p>
          <a
            href={`mailto:${contactEmail}?subject=Cancel%20Subscription%20%2F%20Refund%20Request&body=Please%20cancel%20my%20subscription%20and%20process%20a%20refund%20if%20within%2030%20days.%0A%0AEmail%20used%20at%20checkout%3A%20%5BYOUR%20EMAIL%20HERE%5D`}
            className="inline-block w-full text-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            Email to Cancel / Request Refund
          </a>
        </div>

        <p className="text-xs text-gray-500 text-center mb-6">
          Refunds on the setup fee available within 30 days of purchase.
        </p>

        <div className="text-center">
          <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
