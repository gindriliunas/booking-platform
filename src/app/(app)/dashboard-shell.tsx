"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { ProviderProvider } from "@/components/provider-context";
import { Sidebar } from "@/components/layout/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProviderProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile top bar */}
          <header className="flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-lg font-extrabold tracking-tight">
              <span className="text-gray-900">VIV</span>
              <span className="text-indigo-500">-Z</span>
            </span>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ProviderProvider>
  );
}
