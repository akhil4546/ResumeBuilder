"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Sparkles, ChevronDown } from "lucide-react";
import { createResume } from "@/server/actions/resume";
import { Button, Spinner } from "@/components/ui";

export function NewResumeButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function create(sample: boolean) {
    setOpen(false);
    startTransition(async () => {
      const id = await createResume({ sample });
      router.push(`/editor/${id}`);
    });
  }

  return (
    <div className="relative">
      <div className="flex">
        <Button
          onClick={() => create(false)}
          disabled={pending}
          className="rounded-r-none"
        >
          {pending ? <Spinner /> : <Plus className="h-4 w-4" />}
          New resume
        </Button>
        <Button
          onClick={() => setOpen((o) => !o)}
          disabled={pending}
          className="rounded-l-none border-l border-blue-500 px-2"
          aria-label="More options"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <button
              onClick={() => create(false)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50"
            >
              <FileText className="h-4 w-4 text-slate-500" />
              <span>
                <span className="block font-medium text-slate-900">Blank resume</span>
                <span className="text-xs text-slate-500">Start from scratch</span>
              </span>
            </button>
            <button
              onClick={() => create(true)}
              className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                <span className="block font-medium text-slate-900">Use example</span>
                <span className="text-xs text-slate-500">Prefilled sample content</span>
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
