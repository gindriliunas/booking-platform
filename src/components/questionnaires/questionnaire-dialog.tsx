"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: "Short answer",
  textarea: "Long answer",
  yes_no: "Yes / No",
  multiple_choice: "Multiple choice",
  dropdown: "Dropdown",
};

interface Question {
  id?: string;
  label: string;
  type: QuestionType;
  options: string;
  required: boolean;
  sortOrder: number;
}

interface QuestionnaireData {
  id: string;
  title: string;
  description?: string | null;
  assignOnJoin: boolean;
  isActive: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  questionnaire?: QuestionnaireData | null;
  onSuccess: () => void;
}

function emptyQuestion(index: number): Question {
  return { label: "", type: "text", options: "", required: false, sortOrder: index };
}

export function QuestionnaireDialog({ open, onOpenChange, providerId, questionnaire, onSuccess }: Props) {
  const isEdit = !!questionnaire;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignOnJoin, setAssignOnJoin] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion(0)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    if (questionnaire) {
      setTitle(questionnaire.title);
      setDescription(questionnaire.description ?? "");
      setAssignOnJoin(questionnaire.assignOnJoin);
      setIsActive(questionnaire.isActive);
      fetch(`/api/questionnaires/${questionnaire.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.questions?.length) {
            setQuestions(
              data.questions.map((q: { id: string; label: string; type: QuestionType; options: string | null; required: boolean; sortOrder: number }) => ({
                id: q.id,
                label: q.label,
                type: q.type,
                options: q.options ?? "",
                required: q.required,
                sortOrder: q.sortOrder,
              }))
            );
          } else {
            setQuestions([emptyQuestion(0)]);
          }
        });
    } else {
      setTitle("");
      setDescription("");
      setAssignOnJoin(false);
      setIsActive(true);
      setQuestions([emptyQuestion(0)]);
    }
  }, [questionnaire, open]);

  function updateQuestion(index: number, field: keyof Question, value: string | boolean | number) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion(prev.length)]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) =>
      prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, sortOrder: i }))
    );
  }

  function moveQuestion(index: number, direction: "up" | "down") {
    const next = [...questions];
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setQuestions(next.map((q, i) => ({ ...q, sortOrder: i })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    const validQuestions = questions.filter((q) => q.label.trim());
    if (validQuestions.length === 0) { setError("Add at least one question"); return; }
    setLoading(true);
    setError("");
    try {
      const payload = {
        providerId,
        title: title.trim(),
        description: description.trim() || null,
        assignOnJoin,
        isActive,
        questions: validQuestions.map((q, i) => ({
          id: q.id,
          label: q.label.trim(),
          type: q.type,
          options: q.type === "multiple_choice" || q.type === "dropdown" ? q.options : null,
          required: q.required,
          sortOrder: i,
        })),
      };
      const url = isEdit ? `/api/questionnaires/${questionnaire!.id}` : "/api/questionnaires";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Request failed");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this questionnaire? All client responses will also be removed.")) return;
    setLoading(true);
    try {
      await fetch(`/api/questionnaires/${questionnaire!.id}`, { method: "DELETE" });
      onSuccess();
    } catch {
      setError("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Questionnaire" : "New Questionnaire"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Metadata */}
          <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="space-y-1">
              <Label htmlFor="q-title">Title *</Label>
              <Input
                id="q-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. PAR-Q Health Screening, Terms & Conditions"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="q-desc">Description</Label>
              <textarea
                id="q-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instructions or context shown to the client"
                rows={2}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={assignOnJoin}
                  onChange={(e) => setAssignOnJoin(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                Auto-assign to new clients
              </label>
              {isEdit && (
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                  />
                  Active
                </label>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Questions</p>

            {questions.map((q, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
                <div className="flex gap-2 items-start">
                  <div className="flex flex-col gap-0.5 pt-1">
                    <button
                      type="button"
                      onClick={() => moveQuestion(i, "up")}
                      disabled={i === 0}
                      className="text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(i, "down")}
                      disabled={i === questions.length - 1}
                      className="text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Input
                    value={q.label}
                    onChange={(e) => updateQuestion(i, "label", e.target.value)}
                    placeholder={`Question ${i + 1}`}
                    className="flex-1"
                  />
                  <Select
                    value={q.type}
                    onValueChange={(v) => updateQuestion(i, "type", v)}
                  >
                    <SelectTrigger className="w-44 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(QUESTION_TYPE_LABELS) as [QuestionType, string][]).map(([val, lbl]) => (
                        <SelectItem key={val} value={val}>{lbl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => removeQuestion(i)}
                    disabled={questions.length === 1}
                    className="text-gray-300 hover:text-red-500 disabled:opacity-20 transition-colors pt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {(q.type === "multiple_choice" || q.type === "dropdown") && (
                  <textarea
                    value={q.options}
                    onChange={(e) => updateQuestion(i, "options", e.target.value)}
                    placeholder="Enter each option on a new line"
                    rows={3}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ml-6"
                  />
                )}

                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none ml-6">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(i, "required", e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600"
                  />
                  Required
                </label>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Questionnaire"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
