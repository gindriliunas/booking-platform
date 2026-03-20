import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  clientQuestionnaires,
  clientQuestionnaireAnswers,
  questionnaires,
  questionnaireQuestions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [cq] = await db.select().from(clientQuestionnaires).where(eq(clientQuestionnaires.id, id));
  if (!cq) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [questionnaire] = await db
    .select()
    .from(questionnaires)
    .where(eq(questionnaires.id, cq.questionnaireId));

  const questions = await db
    .select()
    .from(questionnaireQuestions)
    .where(eq(questionnaireQuestions.questionnaireId, cq.questionnaireId))
    .orderBy(questionnaireQuestions.sortOrder);

  const answers = await db
    .select()
    .from(clientQuestionnaireAnswers)
    .where(eq(clientQuestionnaireAnswers.clientQuestionnaireId, id));

  return NextResponse.json({ assignment: cq, questionnaire, questions, answers });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { answers } = body; // [{ questionId, value }]

  await db
    .delete(clientQuestionnaireAnswers)
    .where(eq(clientQuestionnaireAnswers.clientQuestionnaireId, id));

  if (answers?.length) {
    await db.insert(clientQuestionnaireAnswers).values(
      answers.map((a: { questionId: string; value: string }) => ({
        clientQuestionnaireId: id,
        questionId: a.questionId,
        value: a.value ?? null,
      }))
    );
  }

  const [updated] = await db
    .update(clientQuestionnaires)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(clientQuestionnaires.id, id))
    .returning();

  return NextResponse.json({ assignment: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(clientQuestionnaires).where(eq(clientQuestionnaires.id, id));
  return NextResponse.json({ ok: true });
}
