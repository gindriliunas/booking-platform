import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import {
  clientQuestionnaires,
  clientQuestionnaireAnswers,
  questionnaires,
  questionnaireQuestions,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";
import { normalizeQuestionnaireAnswersForLlm } from "@/lib/llm/prompt-security";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getPortalClient(session.uid);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { id } = await params;

  const [assignment] = await db
    .select()
    .from(clientQuestionnaires)
    .where(and(eq(clientQuestionnaires.id, id), eq(clientQuestionnaires.clientId, client.id)));

  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [questionnaire] = await db
    .select()
    .from(questionnaires)
    .where(eq(questionnaires.id, assignment.questionnaireId));

  const questions = await db
    .select()
    .from(questionnaireQuestions)
    .where(eq(questionnaireQuestions.questionnaireId, assignment.questionnaireId))
    .orderBy(questionnaireQuestions.sortOrder);

  const answers = await db
    .select()
    .from(clientQuestionnaireAnswers)
    .where(eq(clientQuestionnaireAnswers.clientQuestionnaireId, id));

  return NextResponse.json({ assignment, questionnaire, questions, answers });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getPortalClient(session.uid);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { id } = await params;

  const [assignment] = await db
    .select()
    .from(clientQuestionnaires)
    .where(and(eq(clientQuestionnaires.id, id), eq(clientQuestionnaires.clientId, client.id)));

  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { answers } = body as { answers: { questionId: string; value: string }[] };

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

  // Delete existing answers then insert new ones
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

  // Mark as completed
  await db
    .update(clientQuestionnaires)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(clientQuestionnaires.id, id));

  return NextResponse.json({ ok: true });
}
