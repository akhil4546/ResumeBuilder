import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DateFormat = "short" | "numeric" | "year";

/** Format a YYYY-MM (or YYYY) date string. Empty -> "". */
export function formatDate(
  value?: string | null,
  format: DateFormat = "short"
): string {
  if (!value) return "";
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  if (!year) return value;
  if (format === "year" || !monthStr) return String(year);
  const month = Number(monthStr);
  if (format === "numeric") {
    return `${String(month).padStart(2, "0")}/${year}`;
  }
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[month - 1] ?? ""} ${year}`.trim();
}

/** "Jan 2020 — Present" style range. */
export function formatDateRange(
  start?: string | null,
  end?: string | null,
  current?: boolean,
  format: DateFormat = "short"
): string {
  const s = formatDate(start, format);
  const e = current ? "Present" : formatDate(end, format);
  if (!s && !e) return "";
  if (!e) return s;
  if (!s) return e;
  return `${s} — ${e}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}
