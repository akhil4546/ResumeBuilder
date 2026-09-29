"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Share2,
  ChevronDown,
  FileText,
  FileType,
  FileJson,
  Upload,
  Check,
  Cloud,
  CloudOff,
  History,
  Undo2,
  Redo2,
} from "lucide-react";
import { useStore } from "zustand";
import { useEditorStore } from "@/lib/editor/store";
import { buildExport, parseImport, downloadJson } from "@/lib/resume/io";
import { ShareDialog } from "./share-dialog";
import { HistoryDialog } from "./history-dialog";

function UndoRedo() {
  const canUndo = useStore(useEditorStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useEditorStore.temporal, (s) => s.futureStates.length > 0);

  const run = (dir: "undo" | "redo") => {
    const t = useEditorStore.temporal.getState();
    if (dir === "undo") t.undo();
    else t.redo();
    useEditorStore.getState().setStatus("dirty");
  };

  return (
    <div className="flex items-center">
      <button
        onClick={() => run("undo")}
        disabled={!canUndo}
        title="Undo (⌘Z)"
        aria-label="Undo"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => run("redo")}
        disabled={!canRedo}
        title="Redo (⌘⇧Z)"
        aria-label="Redo"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function SaveStatus() {
  const status = useEditorStore((s) => s.status);
  if (status === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        <Cloud className="h-3.5 w-3.5 animate-pulse" /> Saving…
      </span>
    );
  if (status === "error")
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-500">
        <CloudOff className="h-3.5 w-3.5" /> Save failed
      </span>
    );
  if (status === "dirty")
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-400">
        <Cloud className="h-3.5 w-3.5" /> Unsaved changes
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-600">
      <Check className="h-3.5 w-3.5" /> Saved
    </span>
  );
}

export function EditorTopbar({
  resumeId,
  initialPublic,
  initialSlug,
}: {
  resumeId: string;
  initialPublic: boolean;
  initialSlug: string | null;
}) {
  const title = useEditorStore((s) => s.title);
  const setTitle = useEditorStore((s) => s.setTitle);
  const replaceContent = useEditorStore((s) => s.replaceContent);

  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function exportJson() {
    const s = useEditorStore.getState();
    downloadJson(
      `${title || "resume"}.json`,
      buildExport({ title: s.title, template: s.template, data: s.data, theme: s.theme })
    );
    setExportOpen(false);
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const result = parseImport(text);
      replaceContent(result);
      setImportError(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-0 max-w-xs flex-1 truncate rounded-lg border border-transparent px-2 py-1 text-sm font-semibold text-slate-900 hover:border-slate-200 focus:border-primary focus:outline-none"
          aria-label="Resume title"
        />
        <UndoRedo />
        <SaveStatus />
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onImportFile}
        />
        <button
          onClick={() => setHistoryOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          title="Version history"
        >
          <History className="h-4 w-4" />
          <span className="hidden md:inline">History</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setExportOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <a
                  href={`/print/${resumeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setExportOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4 text-red-500" /> Download PDF
                </a>
                <a
                  href={`/api/resumes/${resumeId}/docx`}
                  onClick={() => setExportOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <FileType className="h-4 w-4 text-blue-500" /> Download Word (.docx)
                </a>
                <button
                  onClick={exportJson}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <FileJson className="h-4 w-4 text-amber-500" /> Export JSON
                </button>
                <button
                  onClick={() => {
                    setExportOpen(false);
                    fileRef.current?.click();
                  }}
                  className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Upload className="h-4 w-4 text-slate-500" /> Import JSON
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setShareOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {importError && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          {importError}
          <button className="ml-3 underline" onClick={() => setImportError(null)}>
            dismiss
          </button>
        </div>
      )}

      {shareOpen && (
        <ShareDialog
          resumeId={resumeId}
          initialPublic={initialPublic}
          initialSlug={initialSlug}
          onClose={() => setShareOpen(false)}
        />
      )}

      {historyOpen && (
        <HistoryDialog resumeId={resumeId} onClose={() => setHistoryOpen(false)} />
      )}
    </div>
  );
}
