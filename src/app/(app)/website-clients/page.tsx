import { db } from "@/lib/db";
import { websiteClients } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ExternalLink, Globe, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLOURS: Record<string, string> = {
  building: "bg-yellow-100 text-yellow-800",
  preview_live: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export default async function WebsiteClientsPage() {
  const clients = await db
    .select()
    .from(websiteClients)
    .orderBy(desc(websiteClients.createdAt));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Website Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} total</p>
        </div>
        <a href="/get-a-website" target="_blank"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
          <ExternalLink className="h-3.5 w-3.5" /> Intake form
        </a>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-gray-400">No clients yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {["Business", "Contact", "Style", "Status", "Preview / Domain", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.businessName}</p>
                    <p className="text-xs text-gray-400">{c.businessType}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{c.name}</p>
                    <a href={`mailto:${c.email}`}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600">
                      <Mail className="h-3 w-3" />{c.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">
                    {c.preferredStyle.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLOURS[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-y-1">
                    {c.previewUrl && (
                      <a href={c.previewUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                        <ExternalLink className="h-3 w-3" /> Preview
                      </a>
                    )}
                    {c.customDomain && (
                      <a href={`https://${c.customDomain}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-green-700 hover:underline">
                        <Globe className="h-3 w-3" /> {c.customDomain}
                      </a>
                    )}
                    {!c.previewUrl && !c.customDomain && (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a href={`/website-activate/${c.id}`} target="_blank"
                      className="text-xs text-gray-500 hover:text-indigo-600 underline underline-offset-2">
                      Client view
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
