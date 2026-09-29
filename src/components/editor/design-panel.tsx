"use client";

import { useEditorStore } from "@/lib/editor/store";
import { FONT_FAMILIES, type ResumeTheme } from "@/lib/resume/schema";
import { Field } from "@/components/ui";

const ACCENT_PRESETS = [
  "#2563eb", "#0ea5e9", "#0d9488", "#16a34a",
  "#9333ea", "#db2777", "#dc2626", "#ea580c",
  "#475569", "#111827",
];

// One-click style presets (accent + font + heading feel).
const STYLE_PRESETS: { name: string; swatch: string; patch: Partial<ResumeTheme> }[] = [
  { name: "Professional", swatch: "#2563eb", patch: { accent: "#2563eb", fontFamily: "Inter", headingStyle: "bar" } },
  { name: "Elegant", swatch: "#111827", patch: { accent: "#1f2937", fontFamily: "Playfair Display", headingStyle: "underline" } },
  { name: "Fresh", swatch: "#0d9488", patch: { accent: "#0d9488", fontFamily: "Poppins", headingStyle: "bar" } },
  { name: "Bold", swatch: "#db2777", patch: { accent: "#db2777", fontFamily: "Lato", headingStyle: "uppercase" } },
  { name: "Technical", swatch: "#7c3aed", patch: { accent: "#7c3aed", fontFamily: "IBM Plex Sans", headingStyle: "bar" } },
  { name: "Understated", swatch: "#475569", patch: { accent: "#475569", fontFamily: "Source Sans 3", headingStyle: "plain" } },
];

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={`${label} — ${value}${suffix ?? ""}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary)]"
      />
    </Field>
  );
}

export function DesignPanel() {
  const theme = useEditorStore((s) => s.theme);
  const patchTheme = useEditorStore((s) => s.patchTheme);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-sm font-semibold text-slate-800">Style presets</div>
        <div className="grid grid-cols-3 gap-2">
          {STYLE_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => patchTheme(p.patch)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: p.swatch }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-slate-800">Accent color</div>
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => patchTheme({ accent: c })}
              className={`h-7 w-7 rounded-full ring-2 ring-offset-2 transition ${
                theme.accent === c ? "ring-slate-400" : "ring-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Accent ${c}`}
            />
          ))}
          <label className="ml-1 inline-flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-300">
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => patchTheme({ accent: e.target.value })}
              className="h-9 w-9 cursor-pointer border-0 p-0"
            />
          </label>
        </div>
      </div>

      <Field label="Font family">
        <select
          value={theme.fontFamily}
          onChange={(e) => patchTheme({ fontFamily: e.target.value })}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </Field>

      <Slider label="Font size" value={theme.fontSize} min={8} max={14} step={0.5} suffix="pt" onChange={(v) => patchTheme({ fontSize: v })} />
      <Slider label="Line height" value={theme.lineHeight} min={1} max={2} step={0.05} onChange={(v) => patchTheme({ lineHeight: v })} />
      <Slider label="Section spacing" value={theme.sectionSpacing} min={4} max={40} step={1} suffix="px" onChange={(v) => patchTheme({ sectionSpacing: v })} />
      <Slider label="Page margin" value={theme.pagePadding} min={16} max={80} step={2} suffix="px" onChange={(v) => patchTheme({ pagePadding: v })} />

      <Field label="Heading style">
        <div className="grid grid-cols-2 gap-2">
          {(["bar", "underline", "uppercase", "plain"] as const).map((h) => (
            <button
              key={h}
              onClick={() => patchTheme({ headingStyle: h })}
              className={`rounded-lg border px-3 py-2 text-sm capitalize ${
                theme.headingStyle === h
                  ? "border-primary bg-blue-50 text-primary"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Layout">
        <div className="grid grid-cols-2 gap-2">
          {(["one", "two"] as const).map((c) => (
            <button
              key={c}
              onClick={() => patchTheme({ columns: c })}
              className={`rounded-lg border px-3 py-2 text-sm ${
                theme.columns === c
                  ? "border-primary bg-blue-50 text-primary"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {c === "one" ? "Single column" : "Two columns"}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Two-column applies to the Modern template (skills/languages move to a sidebar).
        </p>
      </Field>

      <Field label="Page size">
        <div className="grid grid-cols-2 gap-2">
          {(["letter", "a4"] as const).map((p) => (
            <button
              key={p}
              onClick={() => patchTheme({ pageSize: p })}
              className={`rounded-lg border px-3 py-2 text-sm ${
                theme.pageSize === p
                  ? "border-primary bg-blue-50 text-primary"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p === "letter" ? "US Letter" : "A4"}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Date format">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "short", label: "Jan 2024" },
              { id: "numeric", label: "01/2024" },
              { id: "year", label: "2024" },
            ] as const
          ).map((d) => (
            <button
              key={d.id}
              onClick={() => patchTheme({ dateFormat: d.id })}
              className={`rounded-lg border px-2 py-2 text-xs ${
                theme.dateFormat === d.id
                  ? "border-primary bg-blue-50 text-primary"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">Photo</span>
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={theme.showPhoto}
              onChange={(e) => patchTheme({ showPhoto: e.target.checked })}
            />
            Show on templates that support it
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["round", "square"] as const).map((s) => (
            <button
              key={s}
              onClick={() => patchTheme({ photoShape: s })}
              disabled={!theme.showPhoto}
              className={`rounded-lg border px-3 py-2 text-sm capitalize disabled:opacity-40 ${
                theme.photoShape === s
                  ? "border-primary bg-blue-50 text-primary"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Upload a photo in the Content tab. Shown on Sidebar, Executive, Timeline &amp; Compact.
        </p>
      </div>
    </div>
  );
}
