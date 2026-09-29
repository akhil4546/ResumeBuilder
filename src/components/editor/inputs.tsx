"use client";

import { useState } from "react";
import { X, Plus, GripVertical, Trash2, Lightbulb, Sparkles } from "lucide-react";
import { Input, Textarea, Spinner } from "@/components/ui";
import { PhrasePicker } from "./phrase-picker";
import { useAiEnabled } from "./ai-context";
import { improveBullet, generateBullets } from "@/server/actions/ai";

/** Chip-style keyword input. */
export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const v = draft.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setDraft("");
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white p-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={value.length ? "" : placeholder || "Type and press Enter"}
        className="min-w-[120px] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
      />
    </div>
  );
}

/** Editable list of bullet points. */
export function HighlightsEditor({
  value,
  onChange,
  context,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  context?: string;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const aiEnabled = useAiEnabled();
  const [improving, setImproving] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  function update(i: number, text: string) {
    const next = [...value];
    next[i] = text;
    onChange(next);
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function aiFailed(res: { code: string; message?: string }) {
    setAiError(
      res.code === "not_configured"
        ? "AI isn't configured on this server."
        : res.message || "AI request failed."
    );
  }

  async function improve(i: number) {
    const text = value[i]?.trim();
    if (!text) return;
    setAiError(null);
    setImproving(i);
    try {
      const res = await improveBullet(text);
      if (res.ok) update(i, res.data);
      else aiFailed(res);
    } finally {
      setImproving(null);
    }
  }

  async function generate() {
    setAiError(null);
    setGenerating(true);
    try {
      const res = await generateBullets(context || "a professional role");
      if (res.ok) onChange([...value, ...res.data]);
      else aiFailed(res);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-1.5">
      {value.map((line, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <div className="flex flex-col pt-1.5 text-slate-300">
            <button
              type="button"
              onClick={() => move(i, -1)}
              className="hover:text-slate-600"
              aria-label="Move up"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          </div>
          <Textarea
            rows={2}
            value={line}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Describe an accomplishment, ideally with a number…"
            className="flex-1 resize-y"
          />
          <div className="mt-1.5 flex flex-col gap-1">
            {aiEnabled && (
              <button
                type="button"
                onClick={() => improve(i)}
                disabled={improving !== null}
                className="rounded p-1 text-slate-400 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-40"
                aria-label="Improve with AI"
                title="Improve with AI"
              >
                {improving === i ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove bullet"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => onChange([...value, ""])}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> Add bullet
        </button>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline"
        >
          <Lightbulb className="h-4 w-4" /> Ideas
        </button>
        {aiEnabled && (
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:underline disabled:opacity-50"
          >
            {generating ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            Write with AI
          </button>
        )}
      </div>
      {aiError && <p className="text-xs text-red-500">{aiError}</p>}
      {showPicker && (
        <PhrasePicker
          kind="bullet"
          onInsert={(text) => onChange([...value, text])}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

export { Input, Textarea };
