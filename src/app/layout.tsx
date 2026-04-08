import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FirebaseAuthProvider } from "@/components/firebase-auth-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Session Management",
  description:
    "Calendar booking, session tracking and payments for service providers.",
  icons: { icon: "/viv-z-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full bg-gray-50 text-gray-900`}>
        <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
      </body>
    </html>
  );
}
