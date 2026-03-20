import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  clientQuestionnaires,
  clientQuestionnaireAnswers,
  questionnaires,
  questionnaireQuestions,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPortalClient } from "@/lib/portal";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getPortalClient(userId);
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
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getPortalClient(userId);
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

  // Delete existing answers then insert new ones
  await db
    .delete(clientQuestionnaireAnswers)
    .where(eq(clientQuestionnaireAnswers.clientQuestionnaireId, id));

  if (answers && answers.length > 0) {
    await db.insert(clientQuestionnaireAnswers).values(
      answers.map((a) => ({
        clientQuestionnaireId: id,
        questionId: a.questionId,
        value: a.value ?? null,
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
