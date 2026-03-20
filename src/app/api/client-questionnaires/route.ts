import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientQuestionnaires, questionnaires } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const rows = await db
    .select({ cq: clientQuestionnaires, q: questionnaires })
    .from(clientQuestionnaires)
    .innerJoin(questionnaires, eq(clientQuestionnaires.questionnaireId, questionnaires.id))
    .where(eq(clientQuestionnaires.clientId, clientId))
    .orderBy(clientQuestionnaires.assignedAt);

  return NextResponse.json({
    questionnaires: rows.map(({ cq, q }) => ({
      ...cq,
      title: q.title,
      description: q.description,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, questionnaireId } = body;

  if (!clientId || !questionnaireId) {
    return NextResponse.json({ error: "clientId and questionnaireId required" }, { status: 400 });
  }

  const [assignment] = await db
    .insert(clientQuestionnaires)
    .values({ clientId, questionnaireId })
    .returning();

  return NextResponse.json({ assignment }, { status: 201 });
}
