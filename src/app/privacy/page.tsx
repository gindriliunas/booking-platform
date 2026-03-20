import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata = {
  title: "Privacy Policy — VIV-Z",
  description: "Privacy policy for the VIV-Z booking and session management platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <span className="mb-3 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          Legal
        </span>
        <h1 className="mb-2 text-4xl font-black text-gray-900">
          Privacy Policy
        </h1>
        <p className="mb-10 text-sm text-gray-400">Last updated: March 2026</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-black text-gray-900">1. Introduction</h2>
            <p className="mt-2 leading-relaxed">
              VIV-Z ("we", "us", or "our") is committed to protecting the
              privacy of both Providers (service professionals who install
              VIV-Z) and Clients (end-users of the client portal). This Privacy
              Policy explains what data we collect, how we use it, and your
              rights regarding that data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">2. Data We Collect</h2>
            <h3 className="mt-4 font-bold text-gray-800">2a. Provider data</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
              <li>Account information (name, email, business name)</li>
              <li>GoHighLevel sub-account ID and OAuth tokens</li>
              <li>Stripe Connect account ID</li>
              <li>Availability and calendar configuration</li>
              <li>Service packages and subscription plan details</li>
            </ul>
            <h3 className="mt-4 font-bold text-gray-800">2b. Client data</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
              <li>Name and email address</li>
              <li>Phone number (optional, for reminders)</li>
              <li>Booking history and session records</li>
              <li>Package and subscription balances</li>
              <li>Questionnaire responses submitted through the portal</li>
              <li>Payment records (processed by Stripe; VIV-Z does not store card data)</li>
            </ul>
            <h3 className="mt-4 font-bold text-gray-800">2c. Usage data</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
              <li>Log data (IP address, browser type, pages visited)</li>
              <li>Cookies for session management and authentication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">3. How We Use Your Data</h2>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>
                <strong>Providing the Service:</strong> Processing bookings,
                managing packages, syncing data with GoHighLevel, and processing
                payments.
              </li>
              <li>
                <strong>Communications:</strong> Sending booking confirmations,
                session reminders, and support responses.
              </li>
              <li>
                <strong>Security:</strong> Detecting and preventing fraud,
                unauthorized access, and abuse.
              </li>
              <li>
                <strong>Improvements:</strong> Analysing usage patterns to
                improve the Service. This data is aggregated and anonymized.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">4. Data Sharing</h2>
            <p className="mt-2 leading-relaxed">
              We do not sell your personal data. We share data only with:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>
                <strong>GoHighLevel:</strong> Contact data is synced to the
                Provider's GHL sub-account as part of the core integration.
              </li>
              <li>
                <strong>Stripe:</strong> Payment data is processed by Stripe
                under their Privacy Policy.
              </li>
              <li>
                <strong>Resend:</strong> Email delivery service for reminders
                and notifications.
              </li>
              <li>
                <strong>Neon:</strong> Our database infrastructure provider
                (data processed under a DPA).
              </li>
              <li>
                <strong>Clerk:</strong> Authentication provider for the Provider
                dashboard.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">5. Data Retention</h2>
            <p className="mt-2 leading-relaxed">
              We retain your data for as long as your account is active or as
              needed to provide the Service. If you close your account, we will
              delete your personal data within 30 days, except where we are
              required to retain it by law (e.g. financial records).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">6. Your Rights</h2>
            <p className="mt-2 leading-relaxed">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict our processing of your data</li>
              <li>Data portability (receive your data in a machine-readable format)</li>
              <li>Withdraw consent at any time where we rely on consent</li>
            </ul>
            <p className="mt-3 text-sm">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@viv-z.app" className="text-violet-700 underline">
                privacy@viv-z.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">7. Cookies</h2>
            <p className="mt-2 leading-relaxed">
              VIV-Z uses cookies for authentication (session tokens) and
              security. We do not use tracking or advertising cookies. You can
              disable cookies in your browser settings, but this will prevent
              you from staying logged in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">8. Security</h2>
            <p className="mt-2 leading-relaxed">
              We implement industry-standard security measures including
              encrypted data transmission (TLS), encrypted database storage,
              and access controls. No method of transmission over the internet
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">9. Children's Privacy</h2>
            <p className="mt-2 leading-relaxed">
              The Service is not directed at children under 13. We do not
              knowingly collect personal information from children under 13. If
              you believe a child has provided us with personal data, contact us
              and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">10. Changes to This Policy</h2>
            <p className="mt-2 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the updated policy on
              this page and updating the "Last updated" date. Your continued use
              of the Service after changes are posted constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900">11. Contact Us</h2>
            <p className="mt-2 leading-relaxed">
              For privacy-related questions or to exercise your rights, contact
              us at{" "}
              <a
                href="mailto:privacy@viv-z.app"
                className="text-violet-700 underline"
              >
                privacy@viv-z.app
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
