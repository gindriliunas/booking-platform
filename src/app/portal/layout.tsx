import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { PortalFirebaseRedirectHandler } from "@/components/portal-firebase-redirect-handler";
import { PortalMobileNav } from "@/components/portal-mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { CalendarDays, Package, LayoutDashboard, UserCircle, CalendarPlus, ClipboardList } from "lucide-react";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/book", label: "Book a Session", icon: CalendarPlus },
  { href: "/portal/packages", label: "My Plan", icon: Package },
  { href: "/portal/questionnaires", label: "Forms", icon: ClipboardList },
  { href: "/portal/profile", label: "Profile", icon: UserCircle },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isAuthPage =
    pathname.startsWith("/portal/sign-in") ||
    pathname.startsWith("/portal/sign-up") ||
    pathname.startsWith("/portal/oauth/");

  if (!session && !isAuthPage) redirect("/portal/sign-in");
  if (session && isAuthPage) redirect("/portal");
  if (isAuthPage)
    return (
      <>
        <PortalFirebaseRedirectHandler />
        {children}
      </>
    );

  return (
    <>
      <PortalFirebaseRedirectHandler />

      {/* Mobile hamburger + slide-out drawer */}
      <PortalMobileNav navItems={navItems}>
        <div className="flex items-center gap-3">
          <UserMenu redirectTo="/portal/sign-in" />
          <span className="text-xs text-gray-500">Account</span>
        </div>
      </PortalMobileNav>

      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar — hidden on mobile */}
        <aside className="hidden md:flex w-56 flex-col border-r border-gray-200 bg-white shrink-0">
          <div className="flex h-16 items-center gap-2 px-5 border-b border-gray-200">
            <CalendarDays className="h-5 w-5 text-indigo-600" />
          </div>
          <nav className="flex-1 space-y-0.5 p-3">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4 flex items-center gap-3">
            <UserMenu redirectTo="/portal/sign-in" />
            <span className="text-xs text-gray-500">Account</span>
          </div>
        </aside>

        {/* Main content — add top padding on mobile to account for the sticky header */}
        <main className="flex-1 overflow-y-auto p-4 pt-2 md:p-8">{children}</main>
      </div>
    </>
  );
}
