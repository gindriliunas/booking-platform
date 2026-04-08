"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { UserCircle } from "lucide-react";

export function UserMenu({ redirectTo = "/" }: { redirectTo?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
        aria-label="Account menu"
      >
        <UserCircle className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute bottom-10 left-0 z-50 w-36 rounded-md border border-gray-200 bg-white shadow-lg py-1">
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
