"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Package,
  Settings,
  LayoutDashboard,
  CalendarCheck,
  Repeat,
  ClipboardList,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Bookings", icon: CalendarCheck },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/packages", label: "Packages", icon: Package },
  { href: "/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/questionnaires", label: "Questionnaires", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 p-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-slate-700/60 text-white"
                : "text-slate-400 hover:bg-slate-700/40 hover:text-slate-200"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Logo() {
  return (
    <span className="text-xl font-extrabold tracking-tight">
      <span className="text-white">VIV</span>
      <span className="text-indigo-400">-Z</span>
    </span>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-slate-900 shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-slate-700/50">
          <Logo />
        </div>
        <NavLinks />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-700/50">
          <Logo />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavLinks onNavigate={onClose} />
      </aside>
    </>
  );
}
