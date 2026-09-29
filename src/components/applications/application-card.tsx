"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MapPin, DollarSign, FileText, Mail, ExternalLink, CalendarDays } from "lucide-react";
import type { ApplicationDTO } from "@/lib/applications";

export function ApplicationCard({
  app,
  resumeTitle,
  coverTitle,
  onEdit,
  overlay,
}: {
  app: ApplicationDTO;
  resumeTitle?: string;
  coverTitle?: string;
  onEdit?: () => void;
  overlay?: boolean;
}) {
  const sortable = useSortable({ id: app.id, disabled: overlay });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      onClick={onEdit}
      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm active:cursor-grabbing ${
        overlay ? "shadow-lg ring-1 ring-primary/30" : "hover:border-slate-300 hover:shadow"
      }`}
    >
      <div className="font-semibold text-slate-900">{app.company || "Untitled"}</div>
      {app.role && <div className="text-sm text-slate-600">{app.role}</div>}

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
        {app.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {app.location}
          </span>
        )}
        {app.salary && (
          <span className="inline-flex items-center gap-1">
            <DollarSign className="h-3 w-3" /> {app.salary}
          </span>
        )}
        {app.appliedAt && (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {new Date(app.appliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {(resumeTitle || coverTitle || app.jobUrl) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {resumeTitle && (
            <span className="inline-flex max-w-[130px] items-center gap-1 truncate rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
              <FileText className="h-3 w-3 shrink-0" /> <span className="truncate">{resumeTitle}</span>
            </span>
          )}
          {coverTitle && (
            <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
              <Mail className="h-3 w-3" /> Letter
            </span>
          )}
          {app.jobUrl && (
            <a
              href={app.jobUrl.startsWith("http") ? app.jobUrl : `https://${app.jobUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-200"
            >
              <ExternalLink className="h-3 w-3" /> Posting
            </a>
          )}
        </div>
      )}
    </div>
  );
}
