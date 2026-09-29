"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Globe,
  Lock,
  FileText,
} from "lucide-react";
import {
  deleteResume,
  duplicateResume,
  renameResume,
} from "@/server/actions/resume";

type ResumeSummary = {
  id: string;
  title: string;
  template: string;
  isPublic: boolean;
  updatedAt: string;
};

export function ResumeCard({ resume }: { resume: ResumeSummary }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(resume.title);
  const [pending, startTransition] = useTransition();

  function submitRename() {
    setRenaming(false);
    if (title.trim() === resume.title) return;
    startTransition(async () => {
      await renameResume(resume.id, title.trim());
      router.refresh();
    });
  }

  function onDuplicate() {
    setMenuOpen(false);
    startTransition(async () => {
      await duplicateResume(resume.id);
      router.refresh();
    });
  }

  function onDelete() {
    setMenuOpen(false);
    if (!confirm(`Delete "${resume.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteResume(resume.id);
      router.refresh();
    });
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/editor/${resume.id}`}
        className="relative grid h-40 place-items-center bg-gradient-to-br from-slate-50 to-slate-100"
      >
        <div className="flex flex-col items-center text-slate-400">
          <FileText className="h-10 w-10" />
          <span className="mt-2 text-xs capitalize">{resume.template} template</span>
        </div>
      </Link>

      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0 flex-1">
          {renaming ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={submitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRename();
                if (e.key === "Escape") {
                  setTitle(resume.title);
                  setRenaming(false);
                }
              }}
              className="w-full rounded border border-slate-300 px-2 py-1 text-sm font-semibold focus:border-primary focus:outline-none"
            />
          ) : (
            <Link
              href={`/editor/${resume.id}`}
              className="block truncate font-semibold text-slate-900 hover:text-primary"
            >
              {resume.title}
            </Link>
          )}
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            {resume.isPublic ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Globe className="h-3 w-3" /> Public
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3" /> Private
              </span>
            )}
            <span>·</span>
            <span>
              {new Date(resume.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            disabled={pending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Resume options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <MenuItem
                  icon={Pencil}
                  label="Rename"
                  onClick={() => {
                    setMenuOpen(false);
                    setRenaming(true);
                  }}
                />
                <MenuItem icon={Copy} label="Duplicate" onClick={onDuplicate} />
                <MenuItem
                  icon={Trash2}
                  label="Delete"
                  danger
                  onClick={onDelete}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
        danger ? "text-red-600" : "text-slate-700"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
