import { Metadata } from "next"
import { getContactEmail, getCompanyName } from "@/lib/config"

export const metadata: Metadata = {
  title: `Privacy Policy - ${getCompanyName()}`,
  description: `Privacy Policy for ${getCompanyName()} professional website services for local businesses.`,
}

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: February 4, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              At {getCompanyName()}, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website creation and hosting services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li><strong>Business Information:</strong> Business name, address, phone number, hours of operation, and description</li>
              <li><strong>Contact Information:</strong> Email address, name, and any other contact details you provide</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store full payment details)</li>
              <li><strong>Content:</strong> Photos, reviews, and other business content you wish to display on your website</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Usage Data:</strong> Information about how you use our services</li>
              <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, and operating system</li>
              <li><strong>Cookies:</strong> Small data files stored on your device to improve your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>To create and maintain your business website</li>
              <li>To process payments and manage billing</li>
              <li>To communicate with you about your account and services</li>
              <li>To provide customer support</li>
              <li>To improve our services and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Service Providers:</strong> Third-party services that help us operate our business (hosting, payment processing)</li>
              <li><strong>Domain Registrars:</strong> As required for domain registration</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes SSL encryption for secure data transmission and secure storage of sensitive information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy. When you cancel your subscription, we will delete or anonymize your information within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Objection:</strong> Object to processing of your personal data</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a structured format</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us at {contactEmail}.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies to enhance your experience. You can control cookies through your browser settings.
            </p>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Essential Cookies:</strong> Required for the service to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our website</li>
              <li><strong>Preference Cookies:</strong> Remember your preferences and settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Our service may include links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
            </p>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Processing</h3>
            <p className="text-gray-700">
              Payments are processed through Stripe. When you make a payment, you are providing information directly to Stripe, subject to their privacy policy. We do not store your credit card or payment account details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-gray-700">
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify users of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
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
