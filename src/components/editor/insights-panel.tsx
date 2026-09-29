"use client";

import { useMemo } from "react";
import { Check, AlertCircle } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { computeInsights } from "@/lib/resume/insights";

export function InsightsPanel() {
  const data = useEditorStore((s) => s.data);
  const insights = useMemo(() => computeInsights(data), [data]);

  const color =
    insights.score >= 80
      ? "text-emerald-600"
      : insights.score >= 50
      ? "text-amber-600"
      : "text-red-600";
  const ring =
    insights.score >= 80
      ? "#059669"
      : insights.score >= 50
      ? "#d97706"
      : "#dc2626";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div
          className="grid h-16 w-16 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${ring} ${insights.score * 3.6}deg, #e5e7eb 0deg)`,
          }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white">
            <span className={`text-lg font-bold ${color}`}>{insights.score}</span>
          </div>
        </div>
        <div>
          <div className="font-semibold text-slate-900">Resume strength</div>
          <div className="text-sm text-slate-600">
            {insights.passedCount} of {insights.checks.length} checks passed
          </div>
        </div>
      </div>

      <ul className="space-y-2">
        {insights.checks.map((c) => (
          <li
            key={c.id}
            className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-white p-3"
          >
            <span
              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                c.passed ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
              }`}
            >
              {c.passed ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            </span>
            <div>
              <div
                className={`text-sm font-medium ${
                  c.passed ? "text-slate-700" : "text-slate-900"
                }`}
              >
                {c.label}
              </div>
              {!c.passed && c.hint && (
                <div className="text-xs text-slate-500">{c.hint}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
