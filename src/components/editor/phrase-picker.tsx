"use client";

import { useMemo, useState } from "react";
import { X, Plus, Search, Check, Lightbulb } from "lucide-react";
import {
  BULLET_LIBRARY,
  SUMMARY_TEMPLATES,
} from "@/lib/resume/phrases";

export function PhrasePicker({
  kind,
  onInsert,
  onClose,
}: {
  kind: "bullet" | "summary";
  onInsert: (text: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (kind === "summary") {
      return SUMMARY_TEMPLATES.filter(
        (t) =>
          !q ||
          t.label.toLowerCase().includes(q) ||
          t.text.toLowerCase().includes(q)
      ).map((t) => ({ id: t.id, group: t.label, text: t.text }));
    }
    const cats =
      category === "all"
        ? BULLET_LIBRARY
        : BULLET_LIBRARY.filter((c) => c.id === category);
    return cats.flatMap((c) =>
      c.bullets
        .filter((b) => !q || b.toLowerCase().includes(q) || c.label.toLowerCase().includes(q))
        .map((b, i) => ({ id: `${c.id}-${i}`, group: c.label, text: b }))
    );
  }, [kind, q, category]);

  function insert(text: string, id: string) {
    onInsert(text);
    setJustAdded(id);
    setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 900);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            {kind === "summary" ? "Summary examples" : "Bullet point ideas"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 border-b border-slate-100 px-5 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={kind === "summary" ? "Search examples…" : "Search by role or keyword…"}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {kind === "bullet" && (
            <div className="flex flex-wrap gap-1.5">
              <Chip active={category === "all"} onClick={() => setCategory("all")}>
                All
              </Chip>
              {BULLET_LIBRARY.map((c) => (
                <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                  {c.label}
                </Chip>
              ))}
            </div>
          )}
        </div>

        <div className="scroll-thin flex-1 overflow-auto px-5 py-3">
          <p className="mb-2 text-xs text-slate-400">
            Click to insert, then replace the {"{placeholders}"} with your details.
          </p>
          <div className="space-y-2">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => insert(r.text, r.id)}
                className="group flex w-full items-start gap-2 rounded-lg border border-slate-200 p-3 text-left text-sm hover:border-primary hover:bg-blue-50/40"
              >
                <span className="mt-0.5 shrink-0 text-slate-300 group-hover:text-primary">
                  {justAdded === r.id ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </span>
                <span>
                  <span className="mb-0.5 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {r.group}
                  </span>
                  <span className="text-slate-700">{r.text}</span>
                </span>
              </button>
            ))}
            {results.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">No matches.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
