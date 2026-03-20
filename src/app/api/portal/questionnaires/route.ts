import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { clientQuestionnaires, questionnaires } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getPortalClient(userId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const rows = await db
    .select({
      id: clientQuestionnaires.id,
      questionnaireId: clientQuestionnaires.questionnaireId,
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

  return NextResponse.json({ questionnaires: rows });
}
