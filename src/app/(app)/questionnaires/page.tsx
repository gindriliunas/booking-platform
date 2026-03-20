"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ClipboardList, Users, Dumbbell, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionnaireDialog } from "@/components/questionnaires/questionnaire-dialog";
import { QUESTIONNAIRE_TEMPLATES, type QuestionnaireTemplate } from "@/lib/questionnaire-templates";
import { useProvider } from "@/components/provider-context";

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  "Personal Training": <Dumbbell className="h-5 w-5 text-orange-500" />,
  "Massage Therapy": <Hand className="h-5 w-5 text-teal-500" />,
};

const TEMPLATE_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  "Personal Training": {
    bg: "bg-orange-50",
    border: "border-orange-100",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
  },
  "Massage Therapy": {
    bg: "bg-teal-50",
    border: "border-teal-100",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
  },
};

interface Questionnaire {
  id: string;
  title: string;
  description?: string | null;
  assignOnJoin: boolean;
  isActive: boolean;
  questionCount: number;
  createdAt: string;
}

export default function QuestionnairesPage() {
  const { providerId: PROVIDER_ID } = useProvider();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Questionnaire | null>(null);
  const [addingTemplate, setAddingTemplate] = useState<string | null>(null);

  const fetchQuestionnaires = useCallback(async () => {
    if (!PROVIDER_ID) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/questionnaires?providerId=${PROVIDER_ID}`);
      const data = await res.json();
      setQuestionnaires(data.questionnaires ?? []);
    } finally {
      setLoading(false);
    }
  }, [PROVIDER_ID]);

  useEffect(() => { fetchQuestionnaires(); }, [fetchQuestionnaires]);

  function handleSuccess() {
    setDialogOpen(false);
    setEditItem(null);
    fetchQuestionnaires();
  }

  async function handleAddTemplate(template: QuestionnaireTemplate) {
    setAddingTemplate(template.id);
    try {
      await fetch("/api/questionnaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: PROVIDER_ID,
          title: template.title,
          description: template.description,
          assignOnJoin: template.assignOnJoin,
          isActive: true,
          questions: template.questions.map((q, i) => ({
            label: q.label,
            type: q.type,
            options: q.options ?? null,
            required: q.required,
            sortOrder: i,
          })),
        }),
      });
      fetchQuestionnaires();
    } finally {
      setAddingTemplate(null);
    }
  }

  const active = questionnaires.filter((q) => q.isActive);
  const inactive = questionnaires.filter((q) => !q.isActive);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questionnaires</h1>
          <p className="mt-1 text-sm text-gray-500">
            {active.length} active · {inactive.length} inactive
          </p>
        </div>
        <Button
          onClick={() => {
            setEditItem(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Questionnaire
        </Button>
      </div>

      {/* Info banner */}
      <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-800 flex gap-3">
        <Users className="h-4 w-4 mt-0.5 shrink-0 text-indigo-500" />
        <span>
          Questionnaires marked <strong>Auto-assign to new clients</strong> will be automatically sent when a new client is added.
          You can also assign them manually from a client&apos;s profile.
        </span>
      </div>

      {/* Starter templates */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Starter Templates</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUESTIONNAIRE_TEMPLATES.map((template) => {
            const colors = TEMPLATE_COLORS[template.category] ?? {
              bg: "bg-gray-50",
              border: "border-gray-100",
              badge: "bg-gray-100 text-gray-600",
            };
            return (
              <Card key={template.id} className={`border ${colors.border}`}>
                <CardHeader className={`pb-2 ${colors.bg} rounded-t-xl`}>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    {TEMPLATE_ICONS[template.category]}
                    <span className="leading-snug">{template.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-3">
                  <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors.badge}`}>
                        {template.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {template.questions.length} questions
                      </span>
                      {template.assignOnJoin && (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 font-medium">
                          Auto-assign
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddTemplate(template)}
                      disabled={addingTemplate === template.id}
                      className="shrink-0 text-xs"
                    >
                      {addingTemplate === template.id ? "Adding…" : "Use template"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Existing questionnaires */}
      {loading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading…</div>
      ) : questionnaires.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400 space-y-1">
          <ClipboardList className="h-7 w-7 mx-auto text-gray-300 mb-2" />
          <p>No questionnaires yet — use a template above or create your own.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Your Questionnaires</p>
          {[...active, ...inactive].map((q) => (
            <Card key={q.id} className={q.isActive ? "" : "opacity-60"}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="rounded-lg bg-indigo-50 p-2.5 shrink-0 mt-0.5">
                  <ClipboardList className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{q.title}</p>
                    <Badge
                      variant={q.isActive ? "default" : "secondary"}
                      className={q.isActive ? "bg-green-50 text-green-700 border-green-200" : ""}
                    >
                      {q.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {q.assignOnJoin && (
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        Auto-assign
                      </Badge>
                    )}
                  </div>
                  {q.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{q.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {q.questionCount} question{q.questionCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditItem(q);
                    setDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <QuestionnaireDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditItem(null); }}
        providerId={PROVIDER_ID}
        questionnaire={editItem}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
