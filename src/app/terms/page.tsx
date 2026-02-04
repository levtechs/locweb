import { Metadata } from "next"
import { getUpfrontPrice, getMonthlyPrice, getContactEmail, getCompanyName, getRefundDays } from "@/lib/config"

export const metadata: Metadata = {
  title: `Terms of Service - ${getCompanyName()}`,
  description: `Terms of Service for ${getCompanyName()} professional website services for local businesses.`,
}

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: February 4, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using {getCompanyName()}&apos;s services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
            <p className="text-gray-700 mb-4">
              {getCompanyName()} provides professional website creation and hosting services for local businesses. Our services include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Custom-curated landing pages showcasing your business</li>
              <li>Domain name registration assistance</li>
              <li>SSL security certificates</li>
              <li>Web hosting and maintenance</li>
              <li>Mobile-responsive design</li>
              <li>SEO optimization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Pricing and Payment</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Current Pricing:</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>One-time Setup Fee:</strong> {upfrontPrice}</li>
                <li><strong>Monthly Hosting & Maintenance:</strong> {monthlyPrice}</li>
              </ul>
            </div>
            <p className="text-gray-700">
              Payment is processed securely via Stripe. By providing payment information, you authorize us to charge your designated payment method according to the pricing above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription and Cancellation</h2>
            <p className="text-gray-700 mb-4">
              The monthly hosting fee is charged on a recurring basis until cancelled. You may cancel your subscription at any time through your account settings or by contacting us.
            </p>
            <p className="text-gray-700">
              <strong>Important:</strong> Upon cancellation, your website will be deactivated at the end of your current billing period. We recommend backing up any content you wish to retain before cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Refund Policy</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-amber-800 mb-2">{refundDays}-Day Money-Back Guarantee</h3>
              <p className="text-amber-800">
                We offer a {refundDays}-day money-back guarantee on the one-time setup fee ({upfrontPrice}). If you&apos;re not satisfied with our service within {refundDays} days of your initial purchase, we&apos;ll refund your setup fee in full.
              </p>
            </div>
            <p className="text-gray-700 font-medium">
              The monthly {monthlyPrice} hosting and maintenance fee is not eligible for refunds. Upon cancellation, you will not be charged for subsequent months, but we cannot refund partial months or the monthly fee for any reason.
            </p>
            <p className="text-gray-700 mt-4">
              To request a refund, contact us at {contactEmail} within {refundDays} days of your purchase. Refunds will be processed to your original payment method within 5-10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide accurate and complete business information</li>
              <li>Ensure you have the rights to use any photos or content you provide</li>
              <li>Maintain the security of any account credentials</li>
              <li>Use the service in compliance with all applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700">
              You retain ownership of all business content, photos, and information you provide. {getCompanyName()} retains ownership of the website template, design framework, and underlying technology. Upon service termination, we may remove or delete all associated content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700">
              {getCompanyName()} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimer</h2>
            <p className="text-gray-700">
              The service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, either express or implied. We do not warrant that the service will be uninterrupted, timely, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through our website. Continued use of the service after such changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700">
              These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700"><strong>Email:</strong> {contactEmail}</p>
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
