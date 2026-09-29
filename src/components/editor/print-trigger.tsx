"use client";

import { useEffect } from "react";

export function PrintTrigger({ auto }: { auto: boolean }) {
  useEffect(() => {
    if (!auto) return;
    // Wait a beat so fonts/layout settle before printing.
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [auto]);

  return (
    <div className="no-print fixed right-4 top-4 flex gap-2">
      <button
        onClick={() => window.print()}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
      >
        Print / Save as PDF
      </button>
    </div>
  );
}
