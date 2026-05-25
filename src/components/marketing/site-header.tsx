"use client";

import { useState } from "react";
import Link from "next/link";
import { VivZWordmark } from "./logo";

const ACCENT = "#ff5b04";
const BORDER = "rgba(255,255,255,0.08)";

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
  const [open, setOpen] = useState(false);
  const isDark = variant === "dark";

  const navTextColor = isDark ? "rgba(245,245,247,0.55)" : "rgb(75 85 99)";
  const menuBg = isDark ? "rgba(10,10,11,0.98)" : "rgba(255,255,255,0.98)";

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
        {/* Logo */}
        <Link href="/" aria-label="VIV-Z Home" className="opacity-90 transition-opacity hover:opacity-100">
          <VivZWordmark size="sm" tone={isDark ? "onDark" : "onLight"} />
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-8 text-sm md:flex"
          style={{ color: navTextColor }}
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

        <div className="flex items-center gap-3">
          {/* Desktop CTA */}
          <Link
            href={ctaHref}
            className="hidden shrink-0 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all duration-500 hover:scale-105 hover:brightness-110 md:inline-flex"
            style={{ background: ACCENT }}
          >
            {ctaLabel}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="flex md:hidden flex-col items-center justify-center gap-[5px] p-2 rounded-lg transition-colors"
            style={{ color: isDark ? "#f5f5f7" : "#111" }}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span
              className="block h-0.5 w-5 rounded-full transition-all duration-300"
              style={{
                background: "currentColor",
                transform: open ? "translateY(7px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-0.5 w-5 rounded-full transition-all duration-300"
              style={{
                background: "currentColor",
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="block h-0.5 w-5 rounded-full transition-all duration-300"
              style={{
                background: "currentColor",
                transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div
          className="md:hidden"
          style={{
            background: menuBg,
            borderTop: `1px solid ${BORDER}`,
            backdropFilter: "blur(20px)",
          }}
        >
          <nav className="mx-auto max-w-6xl flex flex-col px-6 py-4 gap-1">
            {marketingSiteNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                style={{ color: navTextColor }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
              <Link
                href={ctaHref}
                onClick={() => setOpen(false)}
                className="block w-full rounded-full py-3 text-center text-sm font-bold text-white transition-all duration-300 hover:brightness-110"
                style={{ background: ACCENT }}
              >
                {ctaLabel}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
