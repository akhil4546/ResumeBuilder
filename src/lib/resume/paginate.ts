export type BreakMark = { top: number; bottom: number };

/**
 * Given the total content height, the page height, and the vertical extents of
 * "leaf" break candidates (bullets / entries that shouldn't be split), return
 * the top Y offset of each page. Breaks are snapped to a candidate's top edge so
 * a candidate is never cut across a page boundary — unless a single candidate is
 * taller than a page, in which case it's hard-cut at the page height.
 *
 * The returned array always starts with 0; its length is the page count.
 */
export function computePageBreaks(
  contentHeight: number,
  pageHeight: number,
  leaves: BreakMark[]
): number[] {
  if (pageHeight <= 0 || contentHeight <= pageHeight + 1) return [0];

  const sorted = [...leaves].sort((a, b) => a.top - b.top);
  const breaks: number[] = [0];
  let top = 0;
  let guard = 0;

  while (top + pageHeight < contentHeight - 1 && guard < 200) {
    guard += 1;
    const limit = top + pageHeight;
    const straddler = sorted.find((m) => m.top < limit - 0.5 && m.bottom > limit + 0.5);
    let cut: number;
    if (straddler && straddler.top > top + 1) {
      cut = straddler.top; // push the whole candidate to the next page
    } else {
      cut = limit; // clean gap, or a candidate taller than a page
    }
    if (cut <= top + 1) cut = top + pageHeight; // never stall
    breaks.push(cut);
    top = cut;
  }

  return breaks;
}
