"use client";

import { useMemo, useState } from "react";
import { Plus, Check, Target, Sparkles } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { matchResume, resumeCorpus } from "@/lib/resume/match";
import { tailorToJob } from "@/server/actions/ai";
import { Button, Spinner } from "@/components/ui";
import { useAiEnabled } from "./ai-context";

export function JobMatchPanel() {
  const data = useEditorStore((s) => s.data);
  const addKeywordToSkills = useEditorStore((s) => s.addKeywordToSkills);
  const [jd, setJd] = useState("");
  const [analyzed, setAnalyzed] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const aiEnabled = useAiEnabled();
  const [tips, setTips] = useState<string[] | null>(null);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsError, setTipsError] = useState<string | null>(null);

  const result = useMemo(
    () => (analyzed.trim() ? matchResume(analyzed, data) : null),
    [analyzed, data]
  );

  async function getTips() {
    setTipsError(null);
    setTipsLoading(true);
    setTips(null);
    try {
      const res = await tailorToJob({ jd: analyzed, resumeText: resumeCorpus(data) });
      if (res.ok) setTips(res.data);
      else
        setTipsError(
          res.code === "not_configured"
            ? "AI isn't configured on this server."
            : res.message || "AI request failed."
        );
    } finally {
      setTipsLoading(false);
    }
  }

  const color =
    !result ? "" : result.score >= 70 ? "#059669" : result.score >= 40 ? "#d97706" : "#dc2626";

  function add(term: string) {
    addKeywordToSkills(term);
    setAdded((prev) => new Set(prev).add(term));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Target className="h-4 w-4 text-slate-400" />
        Tailor to a job
      </div>
      <p className="text-xs text-slate-500">
        Paste a job description to see how well your resume matches, and add the
        keywords you&apos;re missing.
      </p>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={7}
        placeholder="Paste the full job description here…"
        className="scroll-thin w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <div className="flex gap-2">
        <Button onClick={() => setAnalyzed(jd)} disabled={!jd.trim()} className="flex-1">
          Analyze match
        </Button>
        {analyzed && (
          <Button
            variant="secondary"
            onClick={() => {
              setJd("");
              setAnalyzed("");
              setAdded(new Set());
              setTips(null);
              setTipsError(null);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {result && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{ background: `conic-gradient(${color} ${result.score * 3.6}deg, #e5e7eb 0deg)` }}
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white">
                <span className="text-lg font-bold" style={{ color }}>
                  {result.score}
                </span>
              </div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Match score</div>
              <div className="text-sm text-slate-600">
                {result.matched.length} of {result.total} key terms found
              </div>
            </div>
          </div>

          {result.missing.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600">
                Missing keywords ({result.missing.length})
              </div>
              <p className="mb-2 text-xs text-slate-500">
                Click one to add it to your Skills (only if it&apos;s genuinely true for you).
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map((k) => {
                  const isAdded = added.has(k.term);
                  return (
                    <button
                      key={k.term}
                      onClick={() => add(k.term)}
                      disabled={isAdded}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        isAdded
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                      }`}
                    >
                      {isAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      {k.term}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {result.matched.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Matched keywords ({result.matched.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.map((k) => (
                  <span
                    key={k.term}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                  >
                    <Check className="h-3 w-3" />
                    {k.term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {aiEnabled && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-3">
              <button
                onClick={getTips}
                disabled={tipsLoading}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:underline disabled:opacity-50"
              >
                {tipsLoading ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {tips ? "Regenerate AI tailoring tips" : "Get AI tailoring tips"}
              </button>
              {tipsError && <p className="mt-1 text-xs text-red-500">{tipsError}</p>}
              {tips && (
                <ul className="mt-2 space-y-1.5">
                  {tips.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="text-violet-400">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
