import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Package, LayoutDashboard, UserCircle, CalendarPlus, ClipboardList } from "lucide-react";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/book", label: "Book a Session", icon: CalendarPlus },
  { href: "/portal/packages", label: "My Plan", icon: Package },
  { href: "/portal/questionnaires", label: "Forms", icon: ClipboardList },
  { href: "/portal/profile", label: "Profile", icon: UserCircle },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/portal/sign-in");

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white shrink-0">
        <div className="flex h-16 items-center gap-2 px-5 border-b border-gray-200">
          <CalendarDays className="h-5 w-5 text-indigo-600" />
          <span className="text-base font-bold text-gray-900">VIV-Z</span>
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
          <UserButton />
          <span className="text-xs text-gray-500">Account</span>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
