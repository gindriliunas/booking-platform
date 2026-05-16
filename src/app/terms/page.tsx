import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata = {
  title: "Terms & Conditions — VIV-Z",
  description: "Terms and conditions for using the VIV-Z website design and hosting service.",
};

const ACCENT = "#ff5b04";
const PAPER = "#f5f5f7";
const MUTED = "rgba(245,245,247,0.45)";
const FAINT = "rgba(245,245,247,0.28)";
const BORDER = "rgba(255,255,255,0.08)";

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0b", color: PAPER }}>
      <MarketingNav />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <span
          className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: `${ACCENT}18`, color: ACCENT }}
        >
          Legal
        </span>
        <h1 className="mb-2 text-4xl font-black" style={{ color: PAPER }}>
          Terms & Conditions
        </h1>
        <p className="mb-10 text-sm" style={{ color: FAINT }}>
          Last updated: May 2026
        </p>

        <div className="space-y-10" style={{ color: MUTED }}>
          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By submitting an enquiry, approving a website design, or subscribing
              to the VIV-Z hosting service ("Service"), you agree to be bound by
              these Terms and Conditions ("Terms"). If you do not agree to these
              Terms, do not use the Service.
            </p>
            <p className="mt-3 leading-relaxed">
              These Terms apply to all clients ("you", "your") who engage VIV-Z
              for website design, hosting, or any associated services.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>2. Description of Service</h2>
            <p className="leading-relaxed">
              VIV-Z is a website design and hosting service for small businesses.
              The Service consists of two distinct parts:
            </p>
            <ul className="mt-3 space-y-2 pl-5" style={{ listStyleType: "disc" }}>
              <li className="leading-relaxed">
                <span style={{ color: PAPER, fontWeight: 600 }}>Website design and build:</span>{" "}
                We design and build a custom website based on your brief and style
                preferences. This is provided free of charge — you do not pay
                anything until you have reviewed a live preview and chosen to proceed.
              </li>
              <li className="leading-relaxed">
                <span style={{ color: PAPER, fontWeight: 600 }}>Hosting subscription:</span>{" "}
                A recurring monthly subscription that keeps your website live. This
                includes global CDN hosting, SSL certificate, custom domain
                connection, and access to the client booking portal.
              </li>
            </ul>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>3. The Free Build</h2>
            <p className="leading-relaxed">
              We will design and build your website at no cost. Once complete, we
              will share a live preview for your review. You may request revisions
              before committing to any payment. You only subscribe if you are
              satisfied with the result.
            </p>
            <p className="mt-3 leading-relaxed">
              The free build does not create any obligation to subscribe. However,
              the website design and all associated work remains the intellectual
              property of VIV-Z until a hosting subscription is active (see
              Section 8).
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>4. Hosting Subscription</h2>
            <p className="leading-relaxed">
              The hosting subscription is billed monthly and begins when you
              confirm you wish to go live. Your subscription includes:
            </p>
            <ul className="mt-3 space-y-1 pl-5" style={{ listStyleType: "disc" }}>
              <li>Global CDN hosting and sub-second load times</li>
              <li>SSL certificate</li>
              <li>Custom domain connection</li>
              <li>Client booking portal (no additional charge)</li>
              <li>Ongoing site maintenance and uptime monitoring</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              You may cancel at any time. Upon cancellation, your website will be
              taken offline at the end of the current billing period. No refunds
              are issued for partial months already billed.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>5. Payments and Billing</h2>
            <p className="leading-relaxed">
              Payments are processed securely via Stripe. By subscribing, you
              agree to Stripe&apos;s Terms of Service. Your subscription renews
              automatically each month until cancelled.
            </p>
            <p className="mt-3 leading-relaxed">
              We reserve the right to update our pricing. Where pricing changes,
              we will provide at least 30 days&apos; notice before the new rate
              applies to your subscription.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>6. Your Responsibilities</h2>
            <p className="leading-relaxed">You are responsible for:</p>
            <ul className="mt-3 space-y-1 pl-5" style={{ listStyleType: "disc" }}>
              <li>Providing accurate business information and content for your website</li>
              <li>Ensuring all content you supply (text, images, logos) does not infringe third-party intellectual property rights</li>
              <li>Complying with all laws applicable to your business and the content published on your website</li>
              <li>Any domain registration costs outside of our Service</li>
            </ul>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>7. Acceptable Use</h2>
            <p className="leading-relaxed">You agree not to use the Service to:</p>
            <ul className="mt-3 space-y-1 pl-5" style={{ listStyleType: "disc" }}>
              <li>Publish unlawful, defamatory, or fraudulent content</li>
              <li>Infringe the intellectual property rights of others</li>
              <li>Distribute malware or engage in phishing</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              We reserve the right to remove content or suspend your website
              without notice if we reasonably believe it violates these provisions.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>8. Intellectual Property</h2>
            <p className="leading-relaxed">
              Upon activation of an active hosting subscription, you are granted a
              non-exclusive licence to use the website design we have created for
              you for as long as your subscription remains active.
            </p>
            <p className="mt-3 leading-relaxed">
              If your subscription is cancelled or never activated, the website
              design, code, and all associated assets remain the exclusive property
              of VIV-Z. You may not reproduce, copy, or repurpose any part of the
              design without prior written consent.
            </p>
            <p className="mt-3 leading-relaxed">
              Content you supply (text, images, logos) remains your property at
              all times.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>9. Data and Privacy</h2>
            <p className="leading-relaxed">
              Your use of the Service is governed by our{" "}
              <a href="/privacy" style={{ color: ACCENT, textDecoration: "underline" }}>
                Privacy Policy
              </a>
              , which is incorporated into these Terms by reference.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>10. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, VIV-Z shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages, including loss of profits, revenue, or business opportunity,
              arising from your use of the Service.
            </p>
            <p className="mt-3 leading-relaxed">
              Our total liability to you for any claim arising out of or in
              connection with the Service shall not exceed the total amount paid by
              you to VIV-Z in the three months preceding the claim.
            </p>
            <p className="mt-3 leading-relaxed">
              The Service is provided on an "as is" and "as available" basis.
              While we take all reasonable steps to maintain uptime, we do not
              guarantee uninterrupted availability.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>11. Termination</h2>
            <p className="leading-relaxed">
              You may cancel your subscription at any time by emailing{" "}
              <a href="mailto:hello@viv-z.com" style={{ color: ACCENT, textDecoration: "underline" }}>
                hello@viv-z.com
              </a>
              . Your website will remain online until the end of the current
              billing period.
            </p>
            <p className="mt-3 leading-relaxed">
              We reserve the right to suspend or terminate your Service immediately
              if you breach these Terms or if continued provision of the Service
              would expose us to legal or reputational risk.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>12. Changes to Terms</h2>
            <p className="leading-relaxed">
              We may update these Terms from time to time. We will notify you of
              material changes by email or by posting the updated Terms on this
              page and updating the "Last updated" date. Your continued use of the
              Service after changes are posted constitutes your acceptance of the
              new Terms.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>13. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms are governed by the laws of England and Wales. Any
              disputes shall be subject to the exclusive jurisdiction of the courts
              of England and Wales.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>14. Contact</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:hello@viv-z.com" style={{ color: ACCENT, textDecoration: "underline" }}>
                hello@viv-z.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      <MarketingFooter variant="dark" />
    </div>
  );
}
