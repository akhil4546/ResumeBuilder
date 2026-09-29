"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutList, Palette, LayoutTemplate, Gauge, Target } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { saveResume } from "@/server/actions/resume";
import type { ResumeData, ResumeTheme } from "@/lib/resume/schema";
import { EditorTopbar } from "./editor-topbar";
import { SectionsPanel } from "./sections-panel";
import { DesignPanel } from "./design-panel";
import { TemplatesPanel } from "./templates-panel";
import { InsightsPanel } from "./insights-panel";
import { JobMatchPanel } from "./job-match-panel";
import { Preview } from "./preview";
import { AiProvider } from "./ai-context";

type Tab = "content" | "design" | "template" | "insights" | "jobmatch";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "content", label: "Content", icon: LayoutList },
  { id: "design", label: "Design", icon: Palette },
  { id: "template", label: "Template", icon: LayoutTemplate },
  { id: "jobmatch", label: "Job Match", icon: Target },
  { id: "insights", label: "Insights", icon: Gauge },
];

export function EditorClient({
  resume,
  aiEnabled,
}: {
  aiEnabled: boolean;
  resume: {
    id: string;
    title: string;
    template: string;
    data: ResumeData;
    theme: ResumeTheme;
    isPublic: boolean;
    slug: string | null;
  };
}) {
  const [tab, setTab] = useState<Tab>("content");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const ready = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize the store during the first render (a useState initializer runs
  // once, on both server and client) so the very first paint already has the
  // real data — no hydration drift. The page remounts this component per
  // resume id via a `key`, so this runs fresh for each resume.
  useState(() => {
    useEditorStore.getState().init({
      id: resume.id,
      title: resume.title,
      template: resume.template,
      data: resume.data,
      theme: resume.theme,
    });
    // Don't let the initial load count as an undoable step.
    useEditorStore.temporal.getState().clear();
    return resume.id;
  });

  // Undo / redo keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z or Ctrl+Y).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      const temporal = useEditorStore.temporal.getState();
      if (key === "z" && !e.shiftKey) {
        if (temporal.pastStates.length) {
          e.preventDefault();
          temporal.undo();
          useEditorStore.getState().setStatus("dirty");
        }
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        if (temporal.futureStates.length) {
          e.preventDefault();
          temporal.redo();
          useEditorStore.getState().setStatus("dirty");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Mark ready (so autosave can fire) only after mount.
  useEffect(() => {
    ready.current = true;
    return () => {
      ready.current = false;
    };
  }, []);

  // Debounced autosave: fires whenever content becomes dirty.
  useEffect(() => {
    const unsub = useEditorStore.subscribe((state) => {
      if (!ready.current || state.status !== "dirty") return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const s = useEditorStore.getState();
        s.setStatus("saving");
        try {
          const res = await saveResume({
            id: s.id,
            title: s.title,
            template: s.template,
            data: s.data,
            theme: s.theme,
          });
          // Only mark saved if no newer edit slipped in.
          if (useEditorStore.getState().status === "saving") {
            s.markSaved(res.savedAt);
          }
        } catch {
          useEditorStore.getState().setStatus("error");
        }
      }, 900);
    });
    return () => {
      unsub();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Warn on unload if there are unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const s = useEditorStore.getState().status;
      if (s === "dirty" || s === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return (
    <AiProvider enabled={aiEnabled}>
    <div className="flex h-screen flex-col bg-background">
      <EditorTopbar
        resumeId={resume.id}
        initialPublic={resume.isPublic}
        initialSlug={resume.slug}
      />

      <div className="flex min-h-0 flex-1">
        {/* Left: editor panel */}
        <div
          className={`flex w-full flex-col border-r border-slate-200 bg-white lg:w-[440px] xl:w-[480px] ${
            mobileView === "edit" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="flex border-b border-slate-200">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-sm font-medium transition ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="scroll-thin min-h-0 flex-1 overflow-auto p-4">
            {tab === "content" && <SectionsPanel />}
            {tab === "design" && <DesignPanel />}
            {tab === "template" && <TemplatesPanel />}
            {tab === "jobmatch" && <JobMatchPanel />}
            {tab === "insights" && <InsightsPanel />}
          </div>
        </div>

        {/* Right: live preview */}
        <div
          className={`min-h-0 flex-1 ${
            mobileView === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          <Preview />
        </div>
      </div>

      {/* Mobile view switcher */}
      <div className="flex border-t border-slate-200 bg-white lg:hidden">
        <button
          onClick={() => setMobileView("edit")}
          className={`flex-1 py-3 text-sm font-medium ${
            mobileView === "edit" ? "text-primary" : "text-slate-500"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-3 text-sm font-medium ${
            mobileView === "preview" ? "text-primary" : "text-slate-500"
          }`}
        >
          Preview
        </button>
      </div>
    </div>
    </AiProvider>
  );
}
