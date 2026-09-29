"use client";

import { useEffect, useState, useTransition } from "react";
import { X, History, Camera, RotateCcw, Check } from "lucide-react";
import { listVersions, saveVersion, restoreVersion } from "@/server/actions/resume";
import { useEditorStore } from "@/lib/editor/store";
import { resumeDataSchema, themeSchema } from "@/lib/resume/schema";
import { Button, Spinner } from "@/components/ui";

type Version = {
  id: string;
  label: string | null;
  template: string;
  createdAt: string;
};

export function HistoryDialog({
  resumeId,
  onClose,
}: {
  resumeId: string;
  onClose: () => void;
}) {
  const replaceContent = useEditorStore((s) => s.replaceContent);
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function refresh() {
    const list = await listVersions(resumeId);
    setVersions(
      list.map((v) => ({
        id: v.id,
        label: v.label,
        template: v.template,
        createdAt: v.createdAt.toISOString(),
      }))
    );
  }

  useEffect(() => {
    let active = true;
    listVersions(resumeId).then((list) => {
      if (!active) return;
      setVersions(
        list.map((v) => ({
          id: v.id,
          label: v.label,
          template: v.template,
          createdAt: v.createdAt.toISOString(),
        }))
      );
    });
    return () => {
      active = false;
    };
  }, [resumeId]);

  function snapshot() {
    startTransition(async () => {
      await saveVersion(resumeId);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      await refresh();
    });
  }

  function restore(id: string) {
    startTransition(async () => {
      const payload = await restoreVersion(id);
      replaceContent({
        data: resumeDataSchema.parse(payload.data),
        theme: themeSchema.parse(payload.theme),
        template: payload.template,
      });
      await refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <History className="h-4 w-4 text-slate-500" />
            Version history
          </h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-3">
          <Button variant="secondary" onClick={snapshot} disabled={pending} className="w-full">
            {saved ? <Check className="h-4 w-4 text-emerald-600" /> : <Camera className="h-4 w-4" />}
            {saved ? "Snapshot saved" : "Save a snapshot now"}
          </Button>
        </div>

        <div className="scroll-thin flex-1 overflow-auto px-5 py-3">
          {versions === null ? (
            <div className="grid place-items-center py-8 text-slate-400">
              <Spinner />
            </div>
          ) : versions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No snapshots yet. Save one to capture the current version.
            </p>
          ) : (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-800">
                      {v.label || "Snapshot"}
                    </div>
                    <div className="text-xs capitalize text-slate-500">
                      {v.template} ·{" "}
                      {new Date(v.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => restore(v.id)}
                    disabled={pending}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
