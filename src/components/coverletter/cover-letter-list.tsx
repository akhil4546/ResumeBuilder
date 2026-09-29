"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Mail, Trash2, ChevronDown, Sparkles, FileText } from "lucide-react";
import {
  createCoverLetter,
  deleteCoverLetter,
} from "@/server/actions/cover-letter";
import { Button, Spinner } from "@/components/ui";

type Item = { id: string; title: string; updatedAt: string };

export function NewCoverLetterButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function create(sample: boolean) {
    setOpen(false);
    startTransition(async () => {
      const id = await createCoverLetter({ sample });
      router.push(`/cover-letters/${id}`);
    });
  }

  return (
    <div className="relative">
      <div className="flex">
        <Button onClick={() => create(false)} disabled={pending} className="rounded-r-none">
          {pending ? <Spinner /> : <Plus className="h-4 w-4" />}
          New cover letter
        </Button>
        <Button
          onClick={() => setOpen((o) => !o)}
          disabled={pending}
          className="rounded-l-none border-l border-blue-500 px-2"
          aria-label="More"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <button onClick={() => create(false)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50">
              <FileText className="h-4 w-4 text-slate-500" /> Blank cover letter
            </button>
            <button onClick={() => create(true)} className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50">
              <Sparkles className="h-4 w-4 text-primary" /> Use example
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function CoverLetterCard({ item }: { item: Item }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`Delete "${item.title}"?`)) return;
    startTransition(async () => {
      await deleteCoverLetter(item.id);
      router.refresh();
    });
  }

  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link href={`/cover-letters/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-primary">
          <Mail className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold text-slate-900 group-hover:text-primary">
            {item.title}
          </span>
          <span className="text-xs text-slate-500">
            Updated{" "}
            {new Date(item.updatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </span>
      </Link>
      <button
        onClick={onDelete}
        disabled={pending}
        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Delete"
      >
        {pending ? <Spinner /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
