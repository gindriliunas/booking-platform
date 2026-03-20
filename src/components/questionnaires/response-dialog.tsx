"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuestionType = "text" | "textarea" | "yes_no" | "multiple_choice" | "dropdown";

interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options: string | null;
  required: boolean;
  sortOrder: number;
}

interface Answer {
  questionId: string;
  value: string | null;
}

interface Assignment {
  id: string;
  status: "pending" | "completed";
  completedAt?: string | null;
}

interface QuestionnaireInfo {
  title: string;
  description?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string | null;
  clientName?: string;
  onSuccess: () => void;
}

export function ResponseDialog({ open, onOpenChange, assignmentId, clientName, onSuccess }: Props) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !assignmentId) return;
    setLoading(true);
    setError("");
    fetch(`/api/client-questionnaires/${assignmentId}`)
      .then((r) => r.json())
      .then((data) => {
        setAssignment(data.assignment);
        setQuestionnaire(data.questionnaire);
        setQuestions(data.questions ?? []);
        const answerMap: Record<string, string> = {};
        for (const a of data.answers ?? []) {
          answerMap[a.questionId] = a.value ?? "";
        }
        setAnswers(answerMap);
      })
      .finally(() => setLoading(false));
  }, [open, assignmentId]);

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validate required fields
    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        setError(`"${q.label}" is required`);
        return;
      }
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/client-questionnaires/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((q) => ({ questionId: q.id, value: answers[q.id] ?? "" })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnsubmit() {
    if (!confirm("Mark this response as pending so it can be re-filled?")) return;
    // Reset to pending by re-opening — we just clear completedAt via a re-assign workaround
    // For simplicity: delete and re-create the assignment
    setSubmitting(true);
    try {
      await fetch(`/api/client-questionnaires/${assignmentId}`, { method: "DELETE" });
      if (assignment) {
        await fetch("/api/client-questionnaires", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: (assignment as Assignment & { clientId?: string }).clientId,
            questionnaireId: questionnaire,
          }),
        });
      }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  const isCompleted = assignment?.status === "completed";

  function renderInput(q: Question) {
    const value = answers[q.id] ?? "";
    if (isCompleted) {
      if (q.type === "yes_no") {
        const isYes = value.toLowerCase() === "yes";
        const isNo = value.toLowerCase() === "no";
        return (
          <span className={`text-sm font-medium ${isYes ? "text-green-700" : isNo ? "text-red-600" : "text-gray-400"}`}>
            {isYes ? "Yes" : isNo ? "No" : "—"}
          </span>
        );
      }
      return <p className="text-sm text-gray-800 whitespace-pre-wrap">{value || <span className="text-gray-400 italic">No answer</span>}</p>;
    }

    switch (q.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            placeholder="Your answer"
          />
        );
      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            placeholder="Your answer"
            rows={3}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        );
      case "yes_no":
        return (
          <div className="flex gap-3">
            {["yes", "no"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={value === opt}
                  onChange={() => setAnswer(q.id, opt)}
                  className="text-indigo-600"
                />
                {opt === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </div>
        );
      case "multiple_choice": {
        const opts = (q.options ?? "").split("\n").map((o) => o.trim()).filter(Boolean);
        return (
          <div className="space-y-1.5">
            {opts.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  checked={value === opt}
                  onChange={() => setAnswer(q.id, opt)}
                  className="text-indigo-600"
                />
                {opt}
              </label>
            ))}
          </div>
        );
      }
      case "dropdown": {
        const opts = (q.options ?? "").split("\n").map((o) => o.trim()).filter(Boolean);
        return (
          <Select value={value || "none"} onValueChange={(v) => setAnswer(q.id, v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select an option</SelectItem>
              {opts.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      default:
        return null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle>{questionnaire?.title ?? "Questionnaire"}</DialogTitle>
            {assignment && (
              <Badge
                variant={isCompleted ? "default" : "secondary"}
                className={isCompleted ? "bg-green-100 text-green-700" : "bg-orange-50 text-orange-700"}
              >
                {isCompleted ? "Completed" : "Pending"}
              </Badge>
            )}
          </div>
          {clientName && (
            <p className="text-sm text-gray-500">{clientName}</p>
          )}
          {questionnaire?.description && (
            <p className="text-sm text-gray-600 mt-1">{questionnaire.description}</p>
          )}
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {questions.map((q, i) => (
              <div key={q.id} className="space-y-1.5">
                <p className="text-sm font-medium text-gray-800">
                  {i + 1}. {q.label}
                  {q.required && !isCompleted && (
                    <span className="text-red-500 ml-0.5">*</span>
                  )}
                </p>
                {renderInput(q)}
              </div>
            ))}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
              <div className="flex-1" />
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {isCompleted ? "Close" : "Cancel"}
              </Button>
              {!isCompleted && (
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Submit Response"}
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
