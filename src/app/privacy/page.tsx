import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata = {
  title: "Privacy Policy — VIV-Z",
  description: "Privacy policy for the VIV-Z website design and hosting service.",
};

const ACCENT = "#ff5b04";
const PAPER = "#f5f5f7";
const MUTED = "rgba(245,245,247,0.45)";
const FAINT = "rgba(245,245,247,0.28)";
const BORDER = "rgba(255,255,255,0.08)";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mb-10 text-sm" style={{ color: FAINT }}>Last updated: May 2026</p>

        <div className="space-y-10" style={{ color: MUTED }}>
          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>1. Introduction</h2>
            <p className="leading-relaxed">
              VIV-Z ("we", "us", or "our") is committed to protecting your
              privacy. This Privacy Policy explains what personal data we collect
              when you enquire about or use our website design and hosting service,
              how we use it, and your rights regarding that data.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>2. Data We Collect</h2>

            <p className="mb-2 font-semibold" style={{ color: PAPER }}>2a. Enquiry and onboarding data</p>
            <p className="mb-2 text-sm leading-relaxed">When you submit a website enquiry or sign up, we collect:</p>
            <ul className="mb-5 space-y-1 pl-5 text-sm" style={{ listStyleType: "disc" }}>
              <li>Full name and email address</li>
              <li>Phone number (optional)</li>
              <li>Business name and business type</li>
              <li>Website style preferences and any brief or notes you provide</li>
              <li>Existing website URL (if applicable)</li>
            </ul>

            <p className="mb-2 font-semibold" style={{ color: PAPER }}>2b. Subscription and billing data</p>
            <ul className="mb-5 space-y-1 pl-5 text-sm" style={{ listStyleType: "disc" }}>
              <li>Billing email address</li>
              <li>Payment records (processed by Stripe — VIV-Z does not store card details)</li>
              <li>Subscription status and billing history</li>
            </ul>

            <p className="mb-2 font-semibold" style={{ color: PAPER }}>2c. Website content data</p>
            <ul className="mb-5 space-y-1 pl-5 text-sm" style={{ listStyleType: "disc" }}>
              <li>Text, images, logos, and other content you supply for your website</li>
              <li>Domain name and any domain connection details</li>
            </ul>

            <p className="mb-2 font-semibold" style={{ color: PAPER }}>2d. Usage data</p>
            <ul className="space-y-1 pl-5 text-sm" style={{ listStyleType: "disc" }}>
              <li>Log data (IP address, browser type, pages visited on viv-z.com)</li>
              <li>Cookies used for session management and authentication</li>
            </ul>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>3. How We Use Your Data</h2>
            <ul className="space-y-3 pl-5" style={{ listStyleType: "disc" }}>
              <li className="leading-relaxed">
                <span style={{ color: PAPER, fontWeight: 600 }}>Delivering the Service:</span>{" "}
                Designing and building your website, connecting your domain, and
                keeping your site hosted and online.
              </li>
              <li className="leading-relaxed">
                <span style={{ color: PAPER, fontWeight: 600 }}>Billing:</span>{" "}
                Processing your monthly hosting subscription via Stripe and
                managing your account.
              </li>
              <li className="leading-relaxed">
                <span style={{ color: PAPER, fontWeight: 600 }}>Communications:</span>{" "}
                Sending design previews, revision updates, subscription receipts,
                and support responses. We do not send marketing emails without
                your explicit consent.
              </li>
              <li className="leading-relaxed">
                <span style={{ color: PAPER, fontWeight: 600 }}>Security:</span>{" "}
                Detecting and preventing fraud and unauthorised access.
              </li>
              <li className="leading-relaxed">
                <span style={{ color: PAPER, fontWeight: 600 }}>Service improvements:</span>{" "}
                Analysing aggregated, anonymised usage data to improve our offering.
              </li>
            </ul>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>4. Legal Basis for Processing</h2>
            <p className="mb-3 leading-relaxed">We process your personal data on the following legal bases:</p>
            <ul className="space-y-2 pl-5" style={{ listStyleType: "disc" }}>
              <li><span style={{ color: PAPER, fontWeight: 600 }}>Contract:</span> Processing necessary to deliver the Service you have requested.</li>
              <li><span style={{ color: PAPER, fontWeight: 600 }}>Legitimate interests:</span> Fraud prevention, service security, and improving our offering.</li>
              <li><span style={{ color: PAPER, fontWeight: 600 }}>Legal obligation:</span> Retaining financial records as required by law.</li>
            </ul>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>5. Data Sharing</h2>
            <p className="mb-3 leading-relaxed">
              We do not sell your personal data. We share data only with trusted
              third-party processors required to deliver the Service:
            </p>
            <ul className="space-y-2 pl-5" style={{ listStyleType: "disc" }}>
              <li><span style={{ color: PAPER, fontWeight: 600 }}>Stripe:</span> Payment processing for your hosting subscription, under their Privacy Policy.</li>
              <li><span style={{ color: PAPER, fontWeight: 600 }}>Vercel:</span> Cloud infrastructure provider that hosts your website and our platform.</li>
              <li><span style={{ color: PAPER, fontWeight: 600 }}>Resend:</span> Email delivery service for notifications and communications.</li>
              <li><span style={{ color: PAPER, fontWeight: 600 }}>Neon:</span> Database infrastructure provider (data processed under a Data Processing Agreement).</li>
              <li><span style={{ color: PAPER, fontWeight: 600 }}>Clerk:</span> Authentication provider for account sign-in and management.</li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed">
              All third-party processors are contractually required to handle your
              data securely and only for the purposes of providing their service to us.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>6. Data Retention</h2>
            <p className="leading-relaxed">
              We retain your personal data for as long as your account is active
              or as needed to provide the Service. If you cancel, we will delete
              your personal data within 90 days, except where we are required to
              retain it by law (e.g. financial records, which are kept for 7 years
              under UK tax law).
            </p>
            <p className="mt-3 leading-relaxed">
              Enquiry data from visitors who do not proceed to a subscription is
              retained for up to 12 months, after which it is deleted.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>7. Your Rights</h2>
            <p className="mb-3 leading-relaxed">Under UK GDPR, you have the following rights:</p>
            <ul className="space-y-1 pl-5" style={{ listStyleType: "disc" }}>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete personal data</li>
              <li>Request deletion of your personal data ("right to be forgotten")</li>
              <li>Object to or restrict our processing of your data</li>
              <li>Data portability — receive your data in a machine-readable format</li>
              <li>Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="mt-3 text-sm">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:hello@viv-z.com" style={{ color: ACCENT, textDecoration: "underline" }}>
                hello@viv-z.com
              </a>
              . We will respond within 30 days.
            </p>
            <p className="mt-2 text-sm">
              You also have the right to lodge a complaint with the Information
              Commissioner&apos;s Office (ICO) at{" "}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: ACCENT, textDecoration: "underline" }}
              >
                ico.org.uk
              </a>
              .
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>8. Cookies</h2>
            <p className="leading-relaxed">
              We use cookies strictly for authentication (session tokens) and
              security on viv-z.com. We do not use tracking, analytics, or
              advertising cookies. Disabling cookies in your browser will prevent
              you from staying signed in to your account.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>9. Security</h2>
            <p className="leading-relaxed">
              We implement industry-standard security measures including encrypted
              data transmission (TLS), encrypted database storage, and strict
              access controls. No method of transmission over the internet is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>10. Children&apos;s Privacy</h2>
            <p className="leading-relaxed">
              The Service is intended for businesses and is not directed at
              individuals under 18. We do not knowingly collect personal data from
              minors. If you believe a minor has provided us with personal data,
              please contact us and we will delete it promptly.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>11. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify
              you of material changes by email or by posting the updated policy on
              this page and updating the "Last updated" date. Your continued use
              of the Service after changes are posted constitutes acceptance.
            </p>
          </section>

          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "2rem" }}>
            <h2 className="mb-3 text-lg font-black" style={{ color: PAPER }}>12. Contact Us</h2>
            <p className="leading-relaxed">
              For privacy-related questions or to exercise your rights, contact
              us at{" "}
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
