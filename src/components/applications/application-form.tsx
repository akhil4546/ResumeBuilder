"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
import {
  createApplication,
  updateApplication,
  deleteApplication,
} from "@/server/actions/application";
import { APP_STATUSES, type ApplicationDTO } from "@/lib/applications";
import { Button, Field, Input, Textarea, Spinner } from "@/components/ui";

type Options = { id: string; title: string }[];

export function ApplicationForm({
  initial,
  defaultStatus,
  resumeOptions,
  coverLetterOptions,
  onClose,
}: {
  initial?: ApplicationDTO;
  defaultStatus?: string;
  resumeOptions: Options;
  coverLetterOptions: Options;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const editing = Boolean(initial);

  const [form, setForm] = useState({
    company: initial?.company ?? "",
    role: initial?.role ?? "",
    status: initial?.status ?? defaultStatus ?? "SAVED",
    location: initial?.location ?? "",
    salary: initial?.salary ?? "",
    jobUrl: initial?.jobUrl ?? "",
    appliedAt: initial?.appliedAt ? initial.appliedAt.slice(0, 10) : "",
    resumeId: initial?.resumeId ?? "",
    coverLetterId: initial?.coverLetterId ?? "",
    jobDescription: initial?.jobDescription ?? "",
    notes: initial?.notes ?? "",
  });

  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() && !form.role.trim()) return;
    const payload = {
      ...form,
      appliedAt: form.appliedAt || null,
      resumeId: form.resumeId || null,
      coverLetterId: form.coverLetterId || null,
    };
    startTransition(async () => {
      if (editing && initial) await updateApplication(initial.id, payload);
      else await createApplication(payload);
      router.refresh();
      onClose();
    });
  }

  function onDelete() {
    if (!initial) return;
    if (!confirm("Delete this application?")) return;
    startTransition(async () => {
      await deleteApplication(initial.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="font-bold text-slate-900">
            {editing ? "Edit application" : "Add application"}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="scroll-thin flex-1 space-y-4 overflow-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <Input value={form.company} onChange={(e) => set({ company: e.target.value })} placeholder="Acme Inc." autoFocus />
            </Field>
            <Field label="Role">
              <Input value={form.role} onChange={(e) => set({ role: e.target.value })} placeholder="Senior Engineer" />
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set({ status: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
              >
                {APP_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Applied date">
              <Input type="date" value={form.appliedAt} onChange={(e) => set({ appliedAt: e.target.value })} />
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => set({ location: e.target.value })} placeholder="Remote / City" />
            </Field>
            <Field label="Salary">
              <Input value={form.salary} onChange={(e) => set({ salary: e.target.value })} placeholder="$120k–150k" />
            </Field>
          </div>

          <Field label="Job posting URL">
            <Input value={form.jobUrl} onChange={(e) => set({ jobUrl: e.target.value })} placeholder="https://…" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Resume used">
              <select
                value={form.resumeId}
                onChange={(e) => set({ resumeId: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">— None —</option>
                {resumeOptions.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Cover letter">
              <select
                value={form.coverLetterId}
                onChange={(e) => set({ coverLetterId: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">— None —</option>
                {coverLetterOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Job description (paste to use with Job Match later)">
            <Textarea rows={4} value={form.jobDescription} onChange={(e) => set({ jobDescription: e.target.value })} />
          </Field>
          <Field label="Notes">
            <Textarea rows={3} value={form.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Recruiter name, next steps, interview prep…" />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-5 py-3">
          <div>
            {editing && (
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner />}
              {editing ? "Save" : "Add"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
