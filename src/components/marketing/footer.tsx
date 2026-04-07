import Link from "next/link";
import { VivZLogo } from "./logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <VivZLogo size="sm" />
            <p className="mt-3 text-sm text-gray-500">
              Booking & session management built for service professionals.
              Integrates with your web builder.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Product
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/#features" className="hover:text-violet-700">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#benefits" className="hover:text-violet-700">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="/getting-started" className="hover:text-violet-700">
                  Getting Started
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
                <Link href="/docs" className="hover:text-violet-700">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-violet-700">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/getting-started" className="hover:text-violet-700">
                  Getting Started Guide
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
                <Link href="/terms" className="hover:text-violet-700">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-violet-700">
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
