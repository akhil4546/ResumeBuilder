"use client";

import { useEffect, useRef, useState } from "react";
import { PAGE_SIZES, type ResumeData, type ResumeTheme } from "@/lib/resume/schema";
import { computePageBreaks } from "@/lib/resume/paginate";
import { getTemplate } from "./index";

/**
 * Renders a resume as real, stacked page sheets. It measures the rendered
 * template once (hidden), computes page-break offsets snapped to entry/bullet
 * boundaries (so nothing is cut mid-line), then renders each page as a fixed
 * page-height window into the same content.
 */
export function PaginatedDocument({
  template,
  data,
  theme,
  className,
  showBadges = true,
}: {
  template: string;
  data: ResumeData;
  theme: ResumeTheme;
  className?: string;
  showBadges?: boolean;
}) {
  const size = PAGE_SIZES[theme.pageSize] ?? PAGE_SIZES.letter;
  const Template = getTemplate(template).component;

  const measureRef = useRef<HTMLDivElement>(null);
  // Break offsets (top Y of each page). Starts as a single page.
  const [breaks, setBreaks] = useState<number[]>([0]);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const recompute = () => {
      const inner = el.firstElementChild as HTMLElement | null;
      if (!inner) return;
      const base = inner.getBoundingClientRect().top;
      const H = inner.getBoundingClientRect().height;
      // Leaf break candidates: elements marked data-break that don't contain
      // another data-break (bullets, or whole entries with no bullets).
      const leaves = Array.from(inner.querySelectorAll<HTMLElement>("[data-break]"))
        .filter((m) => !m.querySelector("[data-break]"))
        .map((m) => {
          const r = m.getBoundingClientRect();
          return { top: r.top - base, bottom: r.bottom - base };
        });
      setBreaks(computePageBreaks(H, size.height, leaves));
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    // Fonts can shift heights after they load.
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(recompute).catch(() => {});
    }
    return () => ro.disconnect();
    // Re-measure when content or layout inputs change.
  }, [template, data, theme, size.height]);

  const pageStyle = { width: size.width, height: size.height } as const;

  return (
    <>
      {/* Hidden measurer — natural height, full width. */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: "absolute",
          left: -99999,
          top: 0,
          width: size.width,
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        <div style={{ width: size.width }}>
          <Template data={data} theme={theme} />
        </div>
      </div>

      {/* Visible stacked pages. */}
      <div className="page-stack">
        {breaks.map((offset, i) => (
          <div key={i} className={`page-sheet ${className ?? ""}`} style={pageStyle}>
            <div style={{ transform: `translateY(${-offset}px)`, width: size.width }}>
              <Template data={data} theme={theme} />
            </div>
            {showBadges && breaks.length > 1 && (
              <span className="page-badge no-print">
                {i + 1} / {breaks.length}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
