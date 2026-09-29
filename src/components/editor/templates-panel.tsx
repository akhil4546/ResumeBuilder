"use client";

import { Check } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { TEMPLATES } from "@/components/templates";

export function TemplatesPanel() {
  const template = useEditorStore((s) => s.template);
  const setTemplate = useEditorStore((s) => s.setTemplate);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Switch templates anytime — your content stays the same.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {TEMPLATES.map((t) => {
          const active = t.id === template;
          return (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                active
                  ? "border-primary bg-blue-50 ring-1 ring-primary"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="grid h-16 w-12 shrink-0 place-items-center overflow-hidden rounded border border-slate-200 bg-white">
                <TemplateThumb id={t.id} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  {t.name}
                  {active && <Check className="h-4 w-4 text-primary" />}
                </div>
                <div className="text-xs text-slate-500">{t.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A tiny abstract preview of each template's layout. */
function TemplateThumb({ id }: { id: string }) {
  const bar = "h-1 rounded-full bg-slate-300";
  const accent = "h-1 rounded-full bg-blue-400";
  if (id === "sidebar") {
    return (
      <div className="flex h-full w-full">
        <div className="flex w-1/3 flex-col gap-1 bg-blue-400 p-1">
          <div className="mx-auto h-3 w-3 rounded-full bg-white/80" />
          <div className="h-1 rounded-full bg-white/70" />
          <div className="h-1 w-2/3 rounded-full bg-white/60" />
        </div>
        <div className="flex-1 space-y-1 p-1">
          <div className="h-1.5 w-2/3 rounded-full bg-slate-500" />
          <div className={bar} />
          <div className="h-1 w-1/2 rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }
  if (id === "executive") {
    return (
      <div className="w-full space-y-1 px-1">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-slate-300" />
          <div className="h-1.5 flex-1 rounded-full bg-slate-500" />
        </div>
        <div className="h-px w-full bg-blue-400" />
        <div className={bar} />
        <div className="h-1 w-2/3 rounded-full bg-slate-200" />
      </div>
    );
  }
  if (id === "timeline") {
    return (
      <div className="w-full space-y-1 px-1">
        <div className="h-1.5 w-2/3 rounded-full bg-slate-500" />
        <div className="ml-1 border-l border-blue-300 pl-1.5">
          <div className={`${bar} relative`}>
            <span className="absolute -left-[7px] top-0 h-1 w-1 rounded-full bg-blue-400" />
          </div>
          <div className="mt-1 h-1 w-2/3 rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }
  if (id === "compact") {
    return (
      <div className="w-full space-y-0.5 px-1">
        <div className="h-1.5 w-2/3 rounded-full bg-slate-500" />
        <div className="border-l-2 border-blue-400 pl-1">
          <div className={bar} />
        </div>
        <div className="border-l-2 border-blue-400 pl-1">
          <div className="h-1 w-3/4 rounded-full bg-slate-200" />
        </div>
        <div className="border-l-2 border-blue-400 pl-1">
          <div className="h-1 w-2/3 rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }
  if (id === "classic") {
    return (
      <div className="w-full space-y-1 px-1">
        <div className="mx-auto h-1.5 w-6 rounded-full bg-slate-400" />
        <div className="mx-auto h-px w-full bg-slate-300" />
        <div className={bar} />
        <div className={bar} />
        <div className="h-1 w-2/3 rounded-full bg-slate-200" />
      </div>
    );
  }
  if (id === "minimal") {
    return (
      <div className="grid w-full grid-cols-3 gap-1 px-1">
        <div className={`${accent} col-span-1`} />
        <div className="col-span-2 space-y-1">
          <div className={bar} />
          <div className="h-1 w-2/3 rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }
  if (id === "ats") {
    return (
      <div className="w-full space-y-1 px-1">
        <div className="h-1.5 w-2/3 rounded-full bg-slate-500" />
        <div className={bar} />
        <div className={bar} />
        <div className="h-1 w-1/2 rounded-full bg-slate-200" />
      </div>
    );
  }
  // modern
  return (
    <div className="w-full space-y-1 px-1">
      <div className="h-1.5 w-2/3 rounded-full bg-slate-500" />
      <div className={accent} />
      <div className={bar} />
      <div className="h-1 w-1/2 rounded-full bg-slate-200" />
    </div>
  );
}
