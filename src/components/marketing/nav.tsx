import Link from "next/link";
import { VivZLogo } from "./logo";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" aria-label="VIV-Z Home">
          <VivZLogo size="sm" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          <Link href="/#features" className="transition hover:text-violet-700">
            Features
          </Link>
          <Link href="/getting-started" className="transition hover:text-violet-700">
            Getting Started
          </Link>
          <Link href="/docs" className="transition hover:text-violet-700">
            Docs
          </Link>
          <Link href="/support" className="transition hover:text-violet-700">
            Support
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/portal"
            className="text-sm font-medium text-gray-600 transition hover:text-violet-700"
          >
            Client portal
          </Link>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-gray-600 transition hover:text-violet-700"
          >
            Sign In
          </Link>
          <Link
            href="/install"
            className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
