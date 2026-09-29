"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Check, Cloud, CloudOff } from "lucide-react";
import { saveCoverLetter } from "@/server/actions/cover-letter";
import { COVER_FONTS, type CoverLetterData } from "@/lib/coverletter/schema";
import { Field, Input, Textarea } from "@/components/ui";
import { CoverLetterDocument } from "./cover-letter-document";

const PAGE_WIDTH = 816;
const ACCENTS = ["#2563eb", "#0d9488", "#9333ea", "#db2777", "#dc2626", "#475569", "#111827"];

type Status = "idle" | "dirty" | "saving" | "saved" | "error";

export function CoverLetterEditor({
  id,
  initialTitle,
  initialData,
}: {
  id: string;
  initialTitle: string;
  initialData: CoverLetterData;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [data, setData] = useState<CoverLetterData>(initialData);
  const [status, setStatus] = useState<Status>("idle");
  const ready = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (p: Partial<CoverLetterData>) => {
    setData((d) => ({ ...d, ...p }));
    setStatus("dirty");
  };

  // Autosave (debounced).
  useEffect(() => {
    if (!ready.current) {
      ready.current = true;
      return;
    }
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await saveCoverLetter({ id, title, data });
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [id, title, data]);

  // Preview scaling.
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setScale(Math.min(1, (w - 32) / PAGE_WIDTH));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/cover-letters"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Cover letters</span>
          </Link>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setStatus("dirty");
            }}
            className="min-w-0 max-w-xs flex-1 truncate rounded-lg border border-transparent px-2 py-1 text-sm font-semibold text-slate-900 hover:border-slate-200 focus:border-primary focus:outline-none"
          />
          <SaveBadge status={status} />
        </div>
        <a
          href={`/print/cover/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">PDF</span>
        </a>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="scroll-thin w-full overflow-auto border-r border-slate-200 bg-white p-5 lg:w-[460px]">
          <div className="space-y-5">
            <Section title="Your details">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" className="col-span-2">
                  <Input value={data.senderName} onChange={(e) => set({ senderName: e.target.value })} />
                </Field>
                <Field label="Email">
                  <Input value={data.senderEmail} onChange={(e) => set({ senderEmail: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <Input value={data.senderPhone} onChange={(e) => set({ senderPhone: e.target.value })} />
                </Field>
                <Field label="Location" className="col-span-2">
                  <Input value={data.senderLocation} onChange={(e) => set({ senderLocation: e.target.value })} />
                </Field>
              </div>
            </Section>

            <Section title="Recipient">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <Input value={data.date} onChange={(e) => set({ date: e.target.value })} placeholder="July 1, 2026" />
                </Field>
                <Field label="Company">
                  <Input value={data.company} onChange={(e) => set({ company: e.target.value })} />
                </Field>
                <Field label="Recipient name">
                  <Input value={data.recipientName} onChange={(e) => set({ recipientName: e.target.value })} placeholder="Hiring Team" />
                </Field>
                <Field label="Recipient title">
                  <Input value={data.recipientTitle} onChange={(e) => set({ recipientTitle: e.target.value })} />
                </Field>
                <Field label="Company address" className="col-span-2">
                  <Textarea rows={2} value={data.companyAddress} onChange={(e) => set({ companyAddress: e.target.value })} />
                </Field>
              </div>
            </Section>

            <Section title="Letter">
              <Field label="Greeting">
                <Input value={data.greeting} onChange={(e) => set({ greeting: e.target.value })} />
              </Field>
              <Field label="Body (separate paragraphs with a blank line)">
                <Textarea rows={12} value={data.body} onChange={(e) => set({ body: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Closing">
                  <Input value={data.closing} onChange={(e) => set({ closing: e.target.value })} />
                </Field>
                <Field label="Signature">
                  <Input value={data.signature} onChange={(e) => set({ signature: e.target.value })} />
                </Field>
              </div>
            </Section>

            <Section title="Style">
              <Field label="Font">
                <select
                  value={data.fontFamily}
                  onChange={(e) => set({ fontFamily: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary focus:outline-none"
                >
                  {COVER_FONTS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </Field>
              <Field label={`Font size — ${data.fontSize}pt`}>
                <input
                  type="range" min={9} max={14} step={0.5}
                  value={data.fontSize}
                  onChange={(e) => set({ fontSize: Number(e.target.value) })}
                  className="w-full accent-[var(--primary)]"
                />
              </Field>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-600">Accent</div>
                <div className="flex gap-2">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => set({ accent: c })}
                      className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ${data.accent === c ? "ring-slate-400" : "ring-transparent"}`}
                      style={{ backgroundColor: c }}
                      aria-label={`Accent ${c}`}
                    />
                  ))}
                </div>
              </div>
            </Section>
          </div>
        </div>

        <div ref={containerRef} className="scroll-thin hidden flex-1 overflow-auto bg-slate-200/70 p-4 lg:block">
          <div style={{ width: PAGE_WIDTH * scale, margin: "0 auto" }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAGE_WIDTH }}>
              <CoverLetterDocument data={data} className="shadow-xl ring-1 ring-black/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      {children}
    </div>
  );
}

function SaveBadge({ status }: { status: Status }) {
  if (status === "saving")
    return <span className="flex items-center gap-1.5 text-xs text-slate-400"><Cloud className="h-3.5 w-3.5 animate-pulse" /> Saving…</span>;
  if (status === "error")
    return <span className="flex items-center gap-1.5 text-xs text-red-500"><CloudOff className="h-3.5 w-3.5" /> Save failed</span>;
  if (status === "dirty")
    return <span className="flex items-center gap-1.5 text-xs text-slate-400"><Cloud className="h-3.5 w-3.5" /> Unsaved</span>;
  if (status === "saved")
    return <span className="flex items-center gap-1.5 text-xs text-emerald-600"><Check className="h-3.5 w-3.5" /> Saved</span>;
  return null;
}
