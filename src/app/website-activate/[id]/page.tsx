import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { VivZLogo } from "@/components/marketing/logo";
import { DomainForm } from "./domain-form";
import { CheckoutButton } from "./checkout-button";

export const dynamic = "force-dynamic";

export default async function WebsiteActivatePage({
  params,
}: {
  params: { id: string };
}) {
  const [client] = await db
    .select()
    .from(websiteClients)
    .where(eq(websiteClients.id, params.id));

  if (!client) notFound();

  const isActive = client.status === "active";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" aria-label="VIV-Z Home">
            <VivZLogo size="sm" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-16">
        {isActive ? (
          <>
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>
            <h1 className="text-3xl font-bold">Payment confirmed!</h1>
            <p className="mt-3 text-gray-500">
              Welcome aboard, {client.name}. One last step — connect your domain
              to make your site live at your own address.
            </p>

            <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-6 space-y-4" id="domain">
              <h2 className="font-semibold">Connect your domain</h2>
              <p className="text-sm text-gray-500">
                Enter your domain below (e.g. <code className="text-gray-700">smithsplumbing.co.uk</code>).
                We'll add it to your Vercel project and email you the DNS records to point.
              </p>
              {client.customDomain ? (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                  Domain linked: <strong>{client.customDomain}</strong>
                </div>
              ) : (
                <DomainForm clientId={client.id} />
              )}

              <div className="border-t border-gray-200 pt-4 text-sm text-gray-500 space-y-2">
                <p className="font-medium text-gray-700">Don't have a domain yet?</p>
                <p>
                  We recommend{" "}
                  <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer"
                    className="text-indigo-600 underline underline-offset-2">Namecheap</a>{" "}
                  — a .co.uk domain costs around £8/year. Once you have one, come back to connect it.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Activate your website</h1>
            <p className="mt-3 text-gray-500">
              Your website is ready, {client.name}. Subscribe for £24/month to go live
              with your own domain — cancel anytime.
            </p>

            {client.previewUrl && (
              <a href={client.previewUrl} target="_blank" rel="noopener noreferrer"
                className="mt-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-indigo-600 hover:bg-gray-100 transition">
                View your preview site →
              </a>
            )}

            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-lg">Website Hosting</p>
                  <p className="text-sm text-gray-500">
                    Includes hosting, SSL, SEO, and your custom domain
                  </p>
                </div>
                <p className="text-2xl font-bold">£24<span className="text-sm font-normal text-gray-500">/mo</span></p>
              </div>

              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "Your website live at your own domain",
                  "Fast global CDN hosting via Vercel",
                  "SSL certificate included",
                  "SEO-optimised (sitemap, meta tags)",
                  "Cancel anytime",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span> {item}
                  </li>
                ))}
              </ul>

              <CheckoutButton clientId={client.id} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
