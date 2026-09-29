"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { PaginatedDocument } from "@/components/templates/paginated-document";
import { PAGE_SIZES } from "@/lib/resume/schema";

export function Preview() {
  const template = useEditorStore((s) => s.template);
  const data = useEditorStore((s) => s.data);
  const theme = useEditorStore((s) => s.theme);

  const pageWidth = (PAGE_SIZES[theme.pageSize] ?? PAGE_SIZES.letter).width;

  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.75);
  const [zoom, setZoom] = useState<number | null>(null); // null = auto-fit
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const next = Math.min(1, (width - 32) / pageWidth);
      setFitScale(next > 0 ? next : 0.5);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageWidth]);

  // Track the (unscaled) height of the page stack so we can reserve the right
  // scaled height and avoid extra whitespace / clipping.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setInnerHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = zoom ?? fitScale;
  const clamp = (v: number) => Math.min(2, Math.max(0.3, v));

  return (
    <div className="relative h-full">
      <div className="no-print absolute right-4 top-3 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur">
        <button
          onClick={() => setZoom((z) => clamp((z ?? fitScale) - 0.1))}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-xs font-medium text-slate-600">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => clamp((z ?? fitScale) + 0.1))}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom(null)}
          className={`rounded p-1.5 hover:bg-slate-100 ${zoom === null ? "text-primary" : "text-slate-500"}`}
          aria-label="Fit to width"
          title="Fit to width"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      <div ref={containerRef} className="scroll-thin h-full overflow-auto bg-slate-200/70 p-4">
        <div style={{ width: pageWidth * scale, height: innerHeight * scale, margin: "0 auto" }}>
          <div
            ref={innerRef}
            style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: pageWidth }}
          >
            <PaginatedDocument
              template={template}
              data={data}
              theme={theme}
              className="shadow-xl ring-1 ring-black/5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
