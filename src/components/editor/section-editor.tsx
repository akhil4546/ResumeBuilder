"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, Lightbulb, Sparkles } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { SECTION_META, type Section, type SectionType } from "@/lib/resume/schema";
import { Field, Input, Textarea, Spinner } from "@/components/ui";
import { TagInput, HighlightsEditor } from "./inputs";
import { PhrasePicker } from "./phrase-picker";
import { useAiEnabled } from "./ai-context";
import { writeSummary } from "@/server/actions/ai";
import { asExperience, asSkill } from "@/components/templates/shared";

export function SectionEditor({ section }: { section: Section }) {
  const patchSection = useEditorStore((s) => s.patchSection);
  const addItem = useEditorStore((s) => s.addItem);
  const meta = SECTION_META[section.type];
  const [showExamples, setShowExamples] = useState(false);
  const aiEnabled = useAiEnabled();
  const [writing, setWriting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const data = useEditorStore((s) => s.data);

  async function aiWriteSummary() {
    setAiError(null);
    setWriting(true);
    try {
      const expSection = data.sections.find((s) => s.type === "experience");
      const skillSection = data.sections.find((s) => s.type === "skills");
      const res = await writeSummary({
        headline: data.basics.headline,
        skills: skillSection
          ? skillSection.items.map(asSkill).flatMap((s) => s.keywords)
          : [],
        experience: expSection
          ? expSection.items.map(asExperience).map((e) => ({
              position: e.position,
              company: e.company,
              highlights: e.highlights,
            }))
          : [],
      });
      if (res.ok) patchSection(section.id, { text: res.data });
      else
        setAiError(
          res.code === "not_configured"
            ? "AI isn't configured on this server."
            : res.message || "AI request failed."
        );
    } finally {
      setWriting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Field label="Section title">
        <Input
          value={section.title}
          onChange={(e) => patchSection(section.id, { title: e.target.value })}
        />
      </Field>

      {meta.kind === "text" ? (
        <Field label="Content">
          <Textarea
            rows={6}
            value={section.text}
            onChange={(e) => patchSection(section.id, { text: e.target.value })}
            placeholder={
              section.type === "summary"
                ? "A punchy 2–4 sentence overview of your experience and strengths."
                : "Write the content for this section."
            }
          />
          {section.type === "summary" && (
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setShowExamples(true)}
                className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline"
              >
                <Lightbulb className="h-4 w-4" /> Summary examples
              </button>
              {aiEnabled && (
                <button
                  type="button"
                  onClick={aiWriteSummary}
                  disabled={writing}
                  className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:underline disabled:opacity-50"
                >
                  {writing ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  Write with AI
                </button>
              )}
            </div>
          )}
          {aiError && <p className="mt-1 text-xs text-red-500">{aiError}</p>}
          {showExamples && (
            <PhrasePicker
              kind="summary"
              onInsert={(text) =>
                patchSection(section.id, {
                  text: section.text.trim() ? `${section.text}\n\n${text}` : text,
                })
              }
              onClose={() => setShowExamples(false)}
            />
          )}
        </Field>
      ) : (
        <div className="space-y-3">
          {section.items.map((item, index) => (
            <ItemCard
              key={(item as { id: string }).id}
              sectionId={section.id}
              type={section.type}
              item={item as Record<string, unknown>}
              index={index}
              total={section.items.length}
            />
          ))}
          <button
            type="button"
            onClick={() => addItem(section.id, section.type)}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" /> Add {meta.label.toLowerCase()} entry
          </button>
        </div>
      )}
    </div>
  );
}

function ItemCard({
  sectionId,
  type,
  item,
  index,
  total,
}: {
  sectionId: string;
  type: SectionType;
  item: Record<string, unknown>;
  index: number;
  total: number;
}) {
  const updateItem = useEditorStore((s) => s.updateItem);
  const removeItem = useEditorStore((s) => s.removeItem);
  const reorderItems = useEditorStore((s) => s.reorderItems);
  const id = item.id as string;
  const items = useEditorStore((s) =>
    s.data.sections.find((x) => x.id === sectionId)?.items
  );

  const set = (p: Record<string, unknown>) => updateItem(sectionId, id, p);

  const moveBy = (dir: -1 | 1) => {
    if (!items) return;
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    reorderItems(sectionId, id, (items[j] as { id: string }).id);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <div className="mb-2 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => moveBy(-1)}
          disabled={index === 0}
          className="rounded p-1 text-slate-400 hover:bg-slate-200 disabled:opacity-30"
          aria-label="Move up"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => moveBy(1)}
          disabled={index === total - 1}
          className="rounded p-1 text-slate-400 hover:bg-slate-200 disabled:opacity-30"
          aria-label="Move down"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => removeItem(sectionId, id)}
          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove entry"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <ItemFields type={type} item={item} set={set} />
    </div>
  );
}

function S(item: Record<string, unknown>, key: string): string {
  return (item[key] as string) ?? "";
}
function A(item: Record<string, unknown>, key: string): string[] {
  return (item[key] as string[]) ?? [];
}

function DateRow({
  item,
  set,
  withCurrent = true,
}: {
  item: Record<string, unknown>;
  set: (p: Record<string, unknown>) => void;
  withCurrent?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Start (YYYY-MM)">
        <Input
          value={S(item, "startDate")}
          onChange={(e) => set({ startDate: e.target.value })}
          placeholder="2021-03"
        />
      </Field>
      <Field label="End (YYYY-MM)">
        <Input
          value={S(item, "endDate")}
          onChange={(e) => set({ endDate: e.target.value })}
          placeholder="2024-01"
          disabled={withCurrent && Boolean(item.current)}
        />
        {withCurrent && (
          <label className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={Boolean(item.current)}
              onChange={(e) => set({ current: e.target.checked })}
            />
            I currently work/study here
          </label>
        )}
      </Field>
    </div>
  );
}

function ItemFields({
  type,
  item,
  set,
}: {
  type: SectionType;
  item: Record<string, unknown>;
  set: (p: Record<string, unknown>) => void;
}) {
  switch (type) {
    case "experience":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Position">
              <Input value={S(item, "position")} onChange={(e) => set({ position: e.target.value })} placeholder="Senior Engineer" />
            </Field>
            <Field label="Company">
              <Input value={S(item, "company")} onChange={(e) => set({ company: e.target.value })} placeholder="Acme Inc." />
            </Field>
          </div>
          <Field label="Location">
            <Input value={S(item, "location")} onChange={(e) => set({ location: e.target.value })} placeholder="Remote / City" />
          </Field>
          <DateRow item={item} set={set} />
          <Field label="Highlights">
            <HighlightsEditor value={A(item, "highlights")} onChange={(v) => set({ highlights: v })} context={`${S(item, "position")} at ${S(item, "company")}`.trim()} />
          </Field>
        </div>
      );

    case "education":
      return (
        <div className="space-y-3">
          <Field label="Institution">
            <Input value={S(item, "institution")} onChange={(e) => set({ institution: e.target.value })} placeholder="University of …" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Degree">
              <Input value={S(item, "degree")} onChange={(e) => set({ degree: e.target.value })} placeholder="B.S." />
            </Field>
            <Field label="Field of study">
              <Input value={S(item, "area")} onChange={(e) => set({ area: e.target.value })} placeholder="Computer Science" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <Input value={S(item, "location")} onChange={(e) => set({ location: e.target.value })} />
            </Field>
            <Field label="GPA (optional)">
              <Input value={S(item, "gpa")} onChange={(e) => set({ gpa: e.target.value })} placeholder="3.8" />
            </Field>
          </div>
          <DateRow item={item} set={set} />
          <Field label="Highlights (optional)">
            <HighlightsEditor value={A(item, "highlights")} onChange={(v) => set({ highlights: v })} context={`${S(item, "degree")} ${S(item, "area")}`.trim()} />
          </Field>
        </div>
      );

    case "skills":
      return (
        <div className="space-y-3">
          <Field label="Group name (optional)">
            <Input value={S(item, "name")} onChange={(e) => set({ name: e.target.value })} placeholder="Languages" />
          </Field>
          <Field label="Skills">
            <TagInput value={A(item, "keywords")} onChange={(v) => set({ keywords: v })} placeholder="Add a skill and press Enter" />
          </Field>
        </div>
      );

    case "projects":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <Input value={S(item, "name")} onChange={(e) => set({ name: e.target.value })} placeholder="Project name" />
            </Field>
            <Field label="URL">
              <Input value={S(item, "url")} onChange={(e) => set({ url: e.target.value })} placeholder="github.com/…" />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={2} value={S(item, "description")} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <DateRow item={item} set={set} withCurrent={false} />
          <Field label="Highlights">
            <HighlightsEditor value={A(item, "highlights")} onChange={(v) => set({ highlights: v })} context={`Project: ${S(item, "name")}`} />
          </Field>
          <Field label="Tech / keywords">
            <TagInput value={A(item, "keywords")} onChange={(v) => set({ keywords: v })} />
          </Field>
        </div>
      );

    case "certifications":
      return (
        <div className="space-y-3">
          <Field label="Name">
            <Input value={S(item, "name")} onChange={(e) => set({ name: e.target.value })} placeholder="AWS Solutions Architect" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Issuer">
              <Input value={S(item, "issuer")} onChange={(e) => set({ issuer: e.target.value })} placeholder="Amazon" />
            </Field>
            <Field label="Date (YYYY-MM)">
              <Input value={S(item, "date")} onChange={(e) => set({ date: e.target.value })} placeholder="2023-06" />
            </Field>
          </div>
          <Field label="URL (optional)">
            <Input value={S(item, "url")} onChange={(e) => set({ url: e.target.value })} />
          </Field>
        </div>
      );

    case "awards":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <Input value={S(item, "title")} onChange={(e) => set({ title: e.target.value })} />
            </Field>
            <Field label="Awarder">
              <Input value={S(item, "awarder")} onChange={(e) => set({ awarder: e.target.value })} />
            </Field>
          </div>
          <Field label="Date (YYYY-MM)">
            <Input value={S(item, "date")} onChange={(e) => set({ date: e.target.value })} placeholder="2022-11" />
          </Field>
          <Field label="Summary (optional)">
            <Textarea rows={2} value={S(item, "summary")} onChange={(e) => set({ summary: e.target.value })} />
          </Field>
        </div>
      );

    case "languages":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Language">
            <Input value={S(item, "language")} onChange={(e) => set({ language: e.target.value })} placeholder="Spanish" />
          </Field>
          <Field label="Fluency">
            <Input value={S(item, "fluency")} onChange={(e) => set({ fluency: e.target.value })} placeholder="Professional" />
          </Field>
        </div>
      );

    case "custom":
    default:
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <Input value={S(item, "title")} onChange={(e) => set({ title: e.target.value })} />
            </Field>
            <Field label="Subtitle">
              <Input value={S(item, "subtitle")} onChange={(e) => set({ subtitle: e.target.value })} />
            </Field>
          </div>
          <Field label="Date (optional)">
            <Input value={S(item, "date")} onChange={(e) => set({ date: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea rows={2} value={S(item, "description")} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <Field label="Highlights">
            <HighlightsEditor value={A(item, "highlights")} onChange={(v) => set({ highlights: v })} context={S(item, "title")} />
          </Field>
        </div>
      );
  }
}
