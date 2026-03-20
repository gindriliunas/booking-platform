import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questionnaires, questionnaireQuestions } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const providerId = req.nextUrl.searchParams.get("providerId");
  if (!providerId) return NextResponse.json({ error: "providerId required" }, { status: 400 });

  const rows = await db
    .select()
    .from(questionnaires)
    .where(eq(questionnaires.providerId, providerId))
    .orderBy(questionnaires.createdAt);

  const ids = rows.map((r) => r.id);
  const questionRows = ids.length
    ? await db
        .select({ questionnaireId: questionnaireQuestions.questionnaireId })
        .from(questionnaireQuestions)
        .where(inArray(questionnaireQuestions.questionnaireId, ids))
    : [];

  const countMap: Record<string, number> = {};
  for (const q of questionRows) {
    countMap[q.questionnaireId] = (countMap[q.questionnaireId] ?? 0) + 1;
  }

  return NextResponse.json({
    questionnaires: rows.map((r) => ({ ...r, questionCount: countMap[r.id] ?? 0 })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { providerId, title, description, assignOnJoin, isActive, questions: qs } = body;

  if (!providerId || !title) {
    return NextResponse.json({ error: "providerId and title required" }, { status: 400 });
  }

  const [questionnaire] = await db
    .insert(questionnaires)
    .values({
      providerId,
      title,
      description: description ?? null,
      assignOnJoin: assignOnJoin ?? false,
      isActive: isActive ?? true,
    })
    .returning();

  if (qs?.length) {
    await db.insert(questionnaireQuestions).values(
      qs.map((q: { label: string; type: string; options: string | null; required: boolean; sortOrder: number }) => ({
        questionnaireId: questionnaire.id,
        label: q.label,
        type: q.type,
        options: q.options ?? null,
        required: q.required ?? false,
        sortOrder: q.sortOrder ?? 0,
      }))
    );
  }

  return NextResponse.json({ questionnaire }, { status: 201 });
}
