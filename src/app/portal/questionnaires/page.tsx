import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clientQuestionnaires, questionnaires } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { formatDateOnly } from "@/lib/utils";
import Link from "next/link";

export default async function PortalQuestionnairesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/portal/sign-in");

  const client = await getPortalClient(userId);
  if (!client) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 max-w-md">
        <p className="text-sm text-amber-700">No client account linked. Please contact your provider.</p>
      </div>
    );
  }

  const rows = await db
    .select({
      id: clientQuestionnaires.id,
      status: clientQuestionnaires.status,
      assignedAt: clientQuestionnaires.assignedAt,
      completedAt: clientQuestionnaires.completedAt,
      title: questionnaires.title,
      description: questionnaires.description,
    })
    .from(clientQuestionnaires)
    .innerJoin(questionnaires, eq(clientQuestionnaires.questionnaireId, questionnaires.id))
    .where(eq(clientQuestionnaires.clientId, client.id))
    .orderBy(clientQuestionnaires.assignedAt);

  const pending = rows.filter((r) => r.status === "pending");
  const completed = rows.filter((r) => r.status === "completed");

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-indigo-600" /> Forms
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Questionnaires and intake forms from your provider.
        </p>
      </div>

      {/* To Complete */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-800">To Complete</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500">No pending forms.</p>
        ) : (
          pending.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{r.title}</p>
                  {r.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Assigned {formatDateOnly(r.assignedAt.toISOString())}
                  </p>
                </div>
                <Link
                  href={`/portal/questionnaire/${r.id}`}
                  className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Fill in
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Completed */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-800">Completed</h2>
        {completed.length === 0 ? (
          <p className="text-sm text-gray-500">No completed forms yet.</p>
        ) : (
          completed.map((r) => (
            <Card key={r.id} className="opacity-75">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{r.title}</p>
                  {r.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                  )}
                  {r.completedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Completed {formatDateOnly(r.completedAt.toISOString())}
                    </p>
                  )}
                </div>
                <Link
                  href={`/portal/questionnaire/${r.id}`}
                  className="shrink-0 text-sm text-indigo-600 hover:underline"
                >
                  View
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
