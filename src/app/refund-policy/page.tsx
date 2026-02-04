import { Metadata } from "next"
import { getUpfrontPrice, getMonthlyPrice, getContactEmail, getCompanyName, getRefundDays } from "@/lib/config"

export const metadata: Metadata = {
  title: `Refund Policy - ${getCompanyName()}`,
  description: `Refund Policy for ${getCompanyName()} professional website services for local businesses.`,
}

export default function RefundPolicyPage() {
  const upfrontPrice = getUpfrontPrice()
  const monthlyPrice = getMonthlyPrice()
  const refundDays = getRefundDays()
  const contactEmail = getContactEmail()

  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt={getCompanyName()} className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-gray-900">{getCompanyName()}</h1>
            </div>
            <nav className="flex gap-6">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href={`mailto:${contactEmail}`} className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: February 4, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-3">
                <span className="text-3xl">✓</span>
                {refundDays}-Day Money-Back Guarantee
              </h2>
              <p className="text-green-700 text-lg">
                We&apos;re confident you&apos;ll love your new website. If you&apos;re not completely satisfied within {refundDays} days of your purchase, we&apos;ll refund your one-time setup fee.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What&apos;s Eligible for Refund</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-green-800 mb-2 text-lg">✓ One-Time Setup Fee ({upfrontPrice})</h3>
                <p className="text-green-700">
                  Full refund available within {refundDays} days of initial purchase. Includes custom website creation, domain setup, and initial configuration.
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-600 mb-2 text-lg">✗ Monthly Hosting Fee ({monthlyPrice})</h3>
                <p className="text-gray-600">
                  <strong>Not eligible for refunds.</strong> The monthly hosting and maintenance fee covers ongoing server costs, security updates, and support. Upon cancellation, you simply stop paying—no charges for future months.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Timeline</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 text-gray-700 font-medium">Refund processing</td>
                    <td className="py-3 text-gray-700">Within 48 hours of approval</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-700 font-medium">Credit card refunds</td>
                    <td className="py-3 text-gray-700">5-10 business days</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-700 font-medium">PayPal refunds</td>
                    <td className="py-3 text-gray-700">3-5 business days</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-700 font-medium">Bank transfer refunds</td>
                    <td className="py-3 text-gray-700">7-14 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">After Refund Processing</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 mb-4">
                Once your refund is processed:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Your website will be deactivated</li>
                <li>Website content may remain in our backups for up to 30 days</li>
                <li>Domain registrations are handled separately—contact us for details</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Timeline</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 text-gray-700 font-medium">Refund processing</td>
                    <td className="py-3 text-gray-700">Within 48 hours of approval</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-700 font-medium">Credit card refunds</td>
                    <td className="py-3 text-gray-700">5-10 business days</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-700 font-medium">PayPal refunds</td>
                    <td className="py-3 text-gray-700">3-5 business days</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-700 font-medium">Bank transfer refunds</td>
                    <td className="py-3 text-gray-700">7-14 business days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Happens After Refund</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Your website will be deactivated within 24 hours of refund approval</li>
              <li>Your domain registration (if we registered it) will remain active for the remainder of the year</li>
              <li>You can choose to transfer your domain to another provider</li>
              <li>All website content will be deleted from our servers after 30 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cancellation Process</h2>
            <p className="text-gray-700 mb-4">
              To cancel your subscription at any time:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Email us at{" "}
                <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">
                  {contactEmail}
                </a>{" "}
                with &quot;Cancellation Request&quot; in the subject line
              </li>
              <li>Include your business name and email address</li>
              <li>We will confirm cancellation within 24 hours</li>
              <li>Your subscription will end at the end of the current billing period</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Notes</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <ul className="list-disc pl-6 space-y-2 text-amber-800">
                <li>The {refundDays}-day guarantee starts from the date of your initial purchase</li>
                <li>We can only refund the original payment method</li>
                <li>Refunds are processed in USD; currency exchange differences are not refunded</li>
                <li>Promotional or discounted purchases follow the same refund policy</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exceptions</h2>
            <p className="text-gray-700 mb-4">
              We want to be fair to all customers. The following situations may affect refund eligibility:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Abuse of the refund policy (multiple refunds on the same business)</li>
              <li>Fraudulent payment activity</li>
              <li>Requests made more than {refundDays} days after purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Have Questions?</h2>
            <p className="text-gray-700 mb-4">
              We&apos;re here to help. If you have any questions about this policy or need assistance:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> {contactEmail}</p>
              <p className="text-gray-700 mb-2"><strong>Response Time:</strong> Usually within 24 hours</p>
              <p className="text-gray-700"><strong>Hours:</strong> Monday-Friday, 9am-5pm PST</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} {getCompanyName()}. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="/terms" className="hover:text-gray-900">Terms of Service</a>
              <a href="/privacy" className="hover:text-gray-900">Privacy Policy</a>
              <a href="/refund-policy" className="hover:text-gray-900">Refund Policy</a>
              <a href={`mailto:${contactEmail}`} className="hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
