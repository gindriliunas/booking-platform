import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  clientQuestionnaires,
  clientQuestionnaireAnswers,
  questionnaires,
  questionnaireQuestions,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { normalizeQuestionnaireAnswersForLlm } from "@/lib/llm/prompt-security";

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
  const { answers } = body as { answers?: { questionId: string; value: string }[] };

  if (answers && !Array.isArray(answers)) {
    return NextResponse.json({ error: "answers must be an array" }, { status: 400 });
  }

  const normalized =
    answers && answers.length > 0
      ? normalizeQuestionnaireAnswersForLlm(answers)
      : { ok: true as const, answers: [] as { questionId: string; value: string | null }[] };

  if (!normalized.ok) {
    return NextResponse.json(
      {
        error: "Answer content was rejected for safety",
        detail: normalized.error,
        questionId: normalized.questionId,
      },
      { status: 400 }
    );
  }

  await db
    .delete(clientQuestionnaireAnswers)
    .where(eq(clientQuestionnaireAnswers.clientQuestionnaireId, id));

  if (normalized.answers.length > 0) {
    await db.insert(clientQuestionnaireAnswers).values(
      normalized.answers.map((a) => ({
        clientQuestionnaireId: id,
        questionId: a.questionId,
        value: a.value,
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
