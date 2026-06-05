"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  UserCircle,
  X,
} from "lucide-react";
import { UserMenu } from "@/components/user-menu";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/book", label: "Book a Session", icon: CalendarPlus },
  { href: "/portal/packages", label: "My Plan", icon: Package },
  { href: "/portal/questionnaires", label: "Forms", icon: ClipboardList },
  { href: "/portal/profile", label: "Profile", icon: UserCircle },
] as const;

/**
 * Mobile: sidebar is hidden; hamburger opens a slide-over drawer.
 * lg+: persistent left sidebar (same as before).
 * Outer shell uses fixed inset-0 so embeds in short iframes don’t clip content below the fold.
 */
export function PortalShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-0 flex flex-col overflow-hidden bg-gray-50">
      {/* Mobile / tablet top bar — menu is off-canvas until opened */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          aria-expanded={drawerOpen}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-gray-900">Portal</span>
        <div className="w-9" aria-hidden />
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop sidebar — always visible from lg */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
          <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
            <CalendarDays className="h-5 w-5 shrink-0 text-indigo-600" />
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {navItems.map(({ href, label, icon: Icon }) => (
              <NavLink key={href} href={href} label={label} Icon={Icon} pathname={pathname} />
            ))}
          </nav>
          <div className="flex items-center gap-3 border-t border-gray-200 p-4">
            <UserMenu redirectTo="/?callbackUrl=/portal" />
            <span className="text-xs text-gray-500">Account</span>
          </div>
        </aside>

        {/* Mobile drawer overlay */}
        {drawerOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Mobile drawer panel */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-200 ease-out lg:hidden ${
            drawerOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
          aria-hidden={!drawerOpen}
        >
          <div className="flex h-12 items-center justify-between border-b border-gray-200 px-3">
            <span className="text-sm font-semibold text-gray-900">Menu</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(href, pathname)
                    ? "bg-indigo-50 text-indigo-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <UserMenu redirectTo="/?callbackUrl=/portal" />
              <span className="text-xs text-gray-500">Account</span>
            </div>
          </div>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  if (href === "/portal") return pathname === "/portal";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  Icon,
  pathname,
}: {
  href: string;
  label: string;
  Icon: (typeof navItems)[number]["icon"];
  pathname: string | null;
}) {
  const active = isActive(href, pathname);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-indigo-50 text-indigo-800" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}
