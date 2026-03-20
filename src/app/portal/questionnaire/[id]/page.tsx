"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Question = {
  id: string;
  label: string;
  type: "text" | "textarea" | "yes_no" | "multiple_choice" | "dropdown";
  options: string | null;
  required: boolean;
  sortOrder: number;
};

type Answer = { questionId: string; value: string | null };

export default function QuestionnairePage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questionnaire, setQuestionnaire] = useState<{
    title: string;
    description: string | null;
  } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"pending" | "completed">("pending");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/portal/questionnaires/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setQuestionnaire(data.questionnaire);
        setQuestions(data.questions);
        setStatus(data.assignment.status);
        const ansMap: Record<string, string> = {};
        (data.answers as Answer[]).forEach((a) => {
          if (a.value != null) ansMap[a.questionId] = a.value;
        });
        setAnswers(ansMap);
      })
      .catch(() => setError("Failed to load form"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/portal/questionnaires/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((q) => ({
            questionId: q.id,
            value: answers[q.id] ?? "",
          })),
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
      setStatus("completed");
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500 py-8">Loading&hellip;</div>;
  if (error) return <div className="text-sm text-red-600 py-8">{error}</div>;
  if (!questionnaire) return null;

  if (submitted) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-center">
          <p className="text-lg font-semibold text-green-800">Form submitted!</p>
          <p className="text-sm text-green-700 mt-1">Thank you for completing the form.</p>
        </div>
        <Link href="/portal" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const isReadOnly = status === "completed";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/portal" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{questionnaire.title}</h1>
        {questionnaire.description && (
          <p className="mt-1 text-sm text-gray-500">{questionnaire.description}</p>
        )}
        {isReadOnly && (
          <div className="mt-2 inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            Completed
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q) => {
          const opts = q.options ? (JSON.parse(q.options) as string[]) : [];
          const value = answers[q.id] ?? "";
          const setVal = (v: string) =>
            setAnswers((prev) => ({ ...prev, [q.id]: v }));

          return (
            <Card key={q.id}>
              <CardContent className="p-4 space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  {q.label}{" "}
                  {q.required && !isReadOnly && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                {q.type === "text" && (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setVal(e.target.value)}
                    disabled={isReadOnly}
                    required={q.required && !isReadOnly}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                )}
                {q.type === "textarea" && (
                  <textarea
                    value={value}
                    onChange={(e) => setVal(e.target.value)}
                    disabled={isReadOnly}
                    required={q.required && !isReadOnly}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                )}
                {q.type === "yes_no" && (
                  <div className="flex gap-4">
                    {["yes", "no"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm capitalize">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={value.toLowerCase() === opt}
                          onChange={() => setVal(opt)}
                          disabled={isReadOnly}
                          required={q.required && !isReadOnly}
                        />
                        {opt === "yes" ? "Yes" : "No"}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "multiple_choice" && (
                  <div className="space-y-1">
                    {opts.map((opt: string) => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={value === opt}
                          onChange={() => setVal(opt)}
                          disabled={isReadOnly}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "dropdown" && (
                  <select
                    value={value}
                    onChange={(e) => setVal(e.target.value)}
                    disabled={isReadOnly}
                    required={q.required && !isReadOnly}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                  >
                    <option value="">Select&hellip;</option>
                    {opts.map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </CardContent>
            </Card>
          );
        })}

        {!isReadOnly && (
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting\u2026" : "Submit"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
