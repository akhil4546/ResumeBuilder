import * as React from "react";
import { PAGE_SIZES, type ResumeData, type ResumeTheme } from "@/lib/resume/schema";
import type { TemplateProps } from "./shared";
import { ModernTemplate } from "./modern";
import { ClassicTemplate } from "./classic";
import { MinimalTemplate } from "./minimal";
import { AtsTemplate } from "./ats";
import { SidebarTemplate } from "./sidebar";
import { ExecutiveTemplate } from "./executive";
import { CompactTemplate } from "./compact";
import { TimelineTemplate } from "./timeline";

export type TemplateId =
  | "modern"
  | "sidebar"
  | "executive"
  | "timeline"
  | "compact"
  | "classic"
  | "minimal"
  | "ats";

export const TEMPLATES: {
  id: TemplateId;
  name: string;
  description: string;
  component: React.ComponentType<TemplateProps>;
}[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Accent headings, optional two-column layout.",
    component: ModernTemplate,
  },
  {
    id: "sidebar",
    name: "Sidebar",
    description: "Colored sidebar with contact, skills & languages.",
    component: SidebarTemplate,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Refined serif header band with optional photo.",
    component: ExecutiveTemplate,
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Experience on an accent timeline rail.",
    component: TimelineTemplate,
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense layout that fits more — great for senior CVs.",
    component: CompactTemplate,
  },
  {
    id: "classic",
    name: "Classic",
    description: "Centered header, timeless and conservative.",
    component: ClassicTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Quiet, spacious, label-in-gutter layout.",
    component: MinimalTemplate,
  },
  {
    id: "ats",
    name: "ATS Plain",
    description: "Maximally parseable, no color or columns.",
    component: AtsTemplate,
  },
];

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

/** Renders a full resume page (the white sheet) for a given template + theme. */
export function ResumeDocument({
  template,
  data,
  theme,
  className,
}: {
  template: string;
  data: ResumeData;
  theme: ResumeTheme;
  className?: string;
}) {
  const Template = getTemplate(template).component;
  const size = PAGE_SIZES[theme.pageSize] ?? PAGE_SIZES.letter;
  return (
    <div
      className={`resume-page ${className ?? ""}`}
      style={{ width: size.width, minHeight: size.height }}
    >
      <Template data={data} theme={theme} />
    </div>
  );
}
