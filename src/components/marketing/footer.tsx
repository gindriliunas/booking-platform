import Link from "next/link";
import { VivZWordmark } from "./logo";

const DARK_BORDER = "rgba(255,255,255,0.08)";

export type MarketingFooterProps = {
  /** `light` — white footer for docs/legal. `dark` — matches main marketing pages (e.g. contact). */
  variant?: "light" | "dark";
};

export function MarketingFooter({ variant = "light" }: MarketingFooterProps) {
  if (variant === "dark") {
    return (
      <footer className="px-6 py-12" style={{ borderTop: `1px solid ${DARK_BORDER}`, background: "#060607", color: "#f5f5f7" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <VivZWordmark size="sm" tone="onDark" />
              <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "rgba(245,245,247,0.35)" }}>
                Websites, VIV-Z business SaaS, and operations tooling — booking portal included with website hosting.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(245,245,247,0.28)" }}>
                Product
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: "rgba(245,245,247,0.45)" }}>
                <li>
                  <Link href="/" className="transition-colors hover:text-[#f5f5f7]">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/business-management-saas" className="transition-colors hover:text-[#f5f5f7]">
                    CRM
                  </Link>
                </li>
                <li>
                  <Link href="/internal-systems" className="transition-colors hover:text-[#f5f5f7]">
                    Ops &amp; AI
                  </Link>
                </li>
                <li>
                  <Link href="/marketing-advertising" className="transition-colors hover:text-[#f5f5f7]">
                    Marketing &amp; advertising
                  </Link>
                </li>
                <li>
                  <Link href="/get-a-website" className="transition-colors hover:text-[#ff5b04]">
                    Get started free
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(245,245,247,0.28)" }}>
                Resources
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: "rgba(245,245,247,0.45)" }}>
                <li>
                  <Link href="/contact" className="transition-colors hover:text-[#f5f5f7]">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(245,245,247,0.28)" }}>
                Legal
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: "rgba(245,245,247,0.45)" }}>
                <li>
                  <Link href="/terms" className="transition-colors hover:text-[#f5f5f7]">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-[#f5f5f7]">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t pt-6 text-center text-xs" style={{ borderColor: DARK_BORDER, color: "rgba(245,245,247,0.28)" }}>
            © {new Date().getFullYear()} VIV-Z. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <VivZWordmark size="sm" tone="onLight" />
            <p className="mt-3 text-sm text-gray-500">
              Websites, VIV-Z business SaaS, and operations tooling — booking portal included with website hosting.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Product
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-orange-600">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/business-management-saas" className="hover:text-orange-600">
                  CRM
                </Link>
              </li>
              <li>
                <Link href="/internal-systems" className="hover:text-orange-600">
                  Ops &amp; AI
                </Link>
              </li>
              <li>
                <Link href="/marketing-advertising" className="hover:text-orange-600">
                  Marketing &amp; advertising
                </Link>
              </li>
              <li>
                <Link href="/get-a-website" className="hover:text-orange-600">
                  Get started free
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/contact" className="hover:text-orange-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/terms" className="hover:text-orange-600">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-orange-600">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} VIV-Z. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
