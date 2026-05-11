import Link from "next/link";
import { VivZWordmark } from "./logo";

const ACCENT = "#ff5b04";
const BORDER = "rgba(255,255,255,0.08)";

/** Canonical top-level marketing navigation — use on every public/marketing page */
export const marketingSiteNavLinks = [
  { href: "/", label: "Home" },
  {
    href: "/business-management-saas",
    label: "CRM",
    title: "CRM, automation & revenue operations on VIV-Z",
  },
  { href: "/internal-systems", label: "Ops & AI" },
  {
    href: "/marketing-advertising",
    label: "Marketing & ads",
    title: "SEO, Google Ads, Meta & Google Business Profile",
  },
  { href: "/contact", label: "Contact" },
] as const;

export type MarketingSiteHeaderProps = {
  variant?: "dark" | "light";
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
};

export function MarketingSiteHeader({
  variant = "dark",
  ctaHref = "/get-a-website",
  ctaLabel = "Get started free",
  className = "",
}: MarketingSiteHeaderProps) {
  const isDark = variant === "dark";

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-xl ${className}`}
      style={
        isDark
          ? { borderBottom: `1px solid ${BORDER}`, background: "rgba(10,10,11,0.85)" }
          : { borderBottom: "1px solid rgb(229 231 235)", background: "rgba(255,255,255,0.9)" }
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="VIV-Z Home" className="opacity-90 transition-opacity hover:opacity-100">
          <VivZWordmark size="sm" tone={isDark ? "onDark" : "onLight"} />
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm md:flex"
          style={{ color: isDark ? "rgba(245,245,247,0.45)" : "rgb(75 85 99)" }}
        >
          {marketingSiteNavLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={"title" in item ? item.title : undefined}
              className={
                isDark
                  ? "transition-colors duration-300 hover:text-[#f5f5f7]"
                  : "transition-colors duration-300 hover:text-gray-900"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href={ctaHref}
          className="shrink-0 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all duration-500 hover:scale-105 hover:brightness-110"
          style={{ background: ACCENT }}
        >
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}
