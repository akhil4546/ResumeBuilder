"use client";

import { useState, useTransition } from "react";
import { X, Copy, Check, Globe, Lock } from "lucide-react";
import { setPublic } from "@/server/actions/resume";
import { Button, Spinner } from "@/components/ui";

export function ShareDialog({
  resumeId,
  initialPublic,
  initialSlug,
  onClose,
}: {
  resumeId: string;
  initialPublic: boolean;
  initialSlug: string | null;
  onClose: () => void;
}) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const link =
    slug && typeof window !== "undefined"
      ? `${window.location.origin}/r/${slug}`
      : "";

  function toggle(next: boolean) {
    setIsPublic(next);
    startTransition(async () => {
      const res = await setPublic(resumeId, next);
      if (res.slug) setSlug(res.slug);
    });
  }

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Share resume</h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={() => toggle(!isPublic)}
          disabled={pending}
          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
            isPublic ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
          }`}
        >
          <span
            className={`grid h-10 w-10 place-items-center rounded-lg ${
              isPublic ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
            }`}
          >
            {pending ? <Spinner /> : isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </span>
          <span className="flex-1">
            <span className="block font-medium text-slate-900">
              {isPublic ? "Public link is on" : "Private"}
            </span>
            <span className="text-sm text-slate-500">
              {isPublic
                ? "Anyone with the link can view this resume."
                : "Only you can see this resume. Click to publish."}
            </span>
          </span>
        </button>

        {isPublic && link && (
          <div className="mt-4 flex items-center gap-2">
            <input
              readOnly
              value={link}
              className="h-10 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700"
            />
            <Button variant="secondary" onClick={copy} className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
