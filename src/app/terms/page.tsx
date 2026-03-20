import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata = {
  title: "Terms & Conditions — VIV-Z",
  description: "Terms and conditions for using the VIV-Z platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <span className="mb-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          Legal
        </span>
        <h1 className="mb-2 text-4xl font-black text-gray-900">
          Terms & Conditions
        </h1>
        <p className="mb-10 text-sm text-gray-400">
          Last updated: March 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-black text-gray-900">1. Acceptance of Terms</h2>
            <p className="mt-2 leading-relaxed">
              By installing, accessing, or using the VIV-Z platform ("Service"),
              you agree to be bound by these Terms and Conditions ("Terms"). If
              you do not agree to these Terms, do not use the Service.
            </p>
            <p className="mt-2 leading-relaxed">
              These Terms apply to all users of the Service, including service
              providers ("Providers") who install VIV-Z on their GoHighLevel
              account, and end-users ("Clients") who use the client portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">2. Description of Service</h2>
            <p className="mt-2 leading-relaxed">
              VIV-Z is a booking and session management platform designed to
              integrate with GoHighLevel. The Service allows Providers to
              manage client appointments, sell packages and subscriptions,
              process payments via Stripe, and sync data with their GoHighLevel
              sub-account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">3. Account Registration</h2>
            <p className="mt-2 leading-relaxed">
              Providers must have a valid GoHighLevel account to install and use
              VIV-Z. You are responsible for maintaining the confidentiality of
              your account credentials and for all activity that occurs under
              your account.
            </p>
            <p className="mt-2 leading-relaxed">
              You agree to provide accurate, current, and complete information
              when registering and to update such information to keep it
              accurate, current, and complete.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">4. Payments and Billing</h2>
            <p className="mt-2 leading-relaxed">
              VIV-Z uses Stripe to process payments. By using the payment
              features of the Service, you agree to Stripe's Terms of Service.
              VIV-Z is not responsible for any payment disputes between Providers
              and their Clients.
            </p>
            <p className="mt-2 leading-relaxed">
              Providers are solely responsible for their pricing, refund
              policies, and compliance with applicable consumer protection laws
              in their jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">5. GoHighLevel Integration</h2>
            <p className="mt-2 leading-relaxed">
              VIV-Z integrates with GoHighLevel via OAuth. By authorizing this
              connection, you grant VIV-Z permission to read and write contact
              data, custom fields, and trigger workflows within your GoHighLevel
              sub-account. VIV-Z only accesses data necessary to provide the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">6. Acceptable Use</h2>
            <p className="mt-2 leading-relaxed">You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Upload or transmit malicious code or content</li>
              <li>Interfere with the integrity or performance of the Service</li>
              <li>Resell or sub-license the Service without written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">7. Data and Privacy</h2>
            <p className="mt-2 leading-relaxed">
              Your use of the Service is also governed by our{" "}
              <a href="/privacy" className="text-violet-700 underline">
                Privacy Policy
              </a>
              , which is incorporated into these Terms by reference.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">8. Intellectual Property</h2>
            <p className="mt-2 leading-relaxed">
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of VIV-Z and its
              licensors. You may not copy, modify, distribute, or create
              derivative works of any part of the Service without prior written
              consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">9. Limitation of Liability</h2>
            <p className="mt-2 leading-relaxed">
              To the maximum extent permitted by law, VIV-Z shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages, including loss of profits, data, or goodwill, resulting
              from your use of the Service.
            </p>
            <p className="mt-2 leading-relaxed">
              The Service is provided on an "as is" and "as available" basis
              without warranties of any kind, either express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">10. Termination</h2>
            <p className="mt-2 leading-relaxed">
              We reserve the right to suspend or terminate your access to the
              Service at any time, with or without notice, for conduct that we
              believe violates these Terms or is harmful to other users, us, or
              third parties, or for any other reason at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">11. Changes to Terms</h2>
            <p className="mt-2 leading-relaxed">
              We may update these Terms from time to time. We will notify you of
              significant changes by posting the new Terms on this page and
              updating the "Last updated" date. Your continued use of the Service
              after changes are posted constitutes your acceptance of the new
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">12. Contact</h2>
            <p className="mt-2 leading-relaxed">
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:legal@viv-z.app"
                className="text-violet-700 underline"
              >
                legal@viv-z.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
