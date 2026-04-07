import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Session Management",
  description:
    "Calendar booking, session tracking and payments for service providers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/portal/sign-in">
      <html lang="en" className="h-full antialiased">
        <body className={`${inter.className} min-h-full bg-gray-50 text-gray-900`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
