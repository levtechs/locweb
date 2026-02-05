import { Metadata } from "next"
import Link from "next/link"
import { getCompanyName, getCompanyUrl } from "@/lib/config"

export const metadata: Metadata = {
  title: "Payment Successful - Thank You!",
  description: "Your payment has been processed successfully.",
}

export default function SuccessPage() {
  const companyName = getCompanyName()
  const companyUrl = getCompanyUrl()

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white font-sans text-gray-900 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-green-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your payment has been processed successfully.
        </p>

        <div className="bg-amber-50 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">What&apos;s Next?</h2>
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Check your email for confirmation and setup instructions
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              We&apos;ll be in touch within 24 hours to finalize your domain
            </li>
          </ul>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Questions? Contact us at smolsky.lev@gmail.com
        </p>

        <div className="flex flex-col gap-3 justify-center">
          <Link
            href="/buy/cancel"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel subscription or request refund
          </Link>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href={companyUrl}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              Visit {companyName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
