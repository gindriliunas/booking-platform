import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questionnaires, questionnaireQuestions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [questionnaire] = await db.select().from(questionnaires).where(eq(questionnaires.id, id));
  if (!questionnaire) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const questions = await db
    .select()
    .from(questionnaireQuestions)
    .where(eq(questionnaireQuestions.questionnaireId, id))
    .orderBy(questionnaireQuestions.sortOrder);

  return NextResponse.json({ questionnaire, questions });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { title, description, assignOnJoin, isActive, questions: qs } = body;

  const [updated] = await db
    .update(questionnaires)
    .set({
      title,
      description: description ?? null,
      assignOnJoin: assignOnJoin ?? false,
      isActive: isActive ?? true,
      updatedAt: new Date(),
    })
    .where(eq(questionnaires.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Replace all questions
  await db.delete(questionnaireQuestions).where(eq(questionnaireQuestions.questionnaireId, id));
  if (qs?.length) {
    await db.insert(questionnaireQuestions).values(
      qs.map((q: { label: string; type: string; options: string | null; required: boolean; sortOrder: number }) => ({
        questionnaireId: id,
        label: q.label,
        type: q.type,
        options: q.options ?? null,
        required: q.required ?? false,
        sortOrder: q.sortOrder ?? 0,
      }))
    );
  }

  return NextResponse.json({ questionnaire: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(questionnaires).where(eq(questionnaires.id, id));
  return NextResponse.json({ ok: true });
}
