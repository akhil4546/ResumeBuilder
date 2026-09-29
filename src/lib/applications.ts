export const APP_STATUSES = [
  { id: "SAVED", label: "Saved", accent: "#64748b", bg: "bg-slate-50", dot: "bg-slate-400" },
  { id: "APPLIED", label: "Applied", accent: "#2563eb", bg: "bg-blue-50", dot: "bg-blue-500" },
  { id: "INTERVIEWING", label: "Interviewing", accent: "#d97706", bg: "bg-amber-50", dot: "bg-amber-500" },
  { id: "OFFER", label: "Offer", accent: "#059669", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  { id: "REJECTED", label: "Rejected", accent: "#e11d48", bg: "bg-rose-50", dot: "bg-rose-500" },
] as const;

export type AppStatus = (typeof APP_STATUSES)[number]["id"];

export const STATUS_IDS = APP_STATUSES.map((s) => s.id) as AppStatus[];

export function isStatus(v: string): v is AppStatus {
  return (STATUS_IDS as string[]).includes(v);
}

export type ApplicationDTO = {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  jobUrl: string;
  jobDescription: string;
  notes: string;
  status: AppStatus;
  order: number;
  appliedAt: string | null;
  resumeId: string | null;
  coverLetterId: string | null;
};
