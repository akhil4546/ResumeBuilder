import { nanoid } from "nanoid";
import {
  resumeDataSchema,
  themeSchema,
  type ResumeData,
  type ResumeTheme,
} from "./schema";
import { blankResumeData, defaultTheme } from "./defaults";

export type ResumeExport = {
  version: 1;
  app: "resume-builder";
  title: string;
  template: string;
  data: ResumeData;
  theme: ResumeTheme;
};

export function buildExport(input: {
  title: string;
  template: string;
  data: ResumeData;
  theme: ResumeTheme;
}): ResumeExport {
  return {
    version: 1,
    app: "resume-builder",
    title: input.title,
    template: input.template,
    data: input.data,
    theme: input.theme,
  };
}

type ImportResult = {
  data: ResumeData;
  theme?: ResumeTheme;
  template?: string;
  title?: string;
};

/** Parse JSON text into resume data. Supports our export and JSON Resume. */
export function parseImport(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const obj = raw as Record<string, unknown>;

  // Our own export format.
  if (obj && obj.app === "resume-builder" && obj.data) {
    return {
      data: resumeDataSchema.parse(obj.data),
      theme: obj.theme ? themeSchema.parse(obj.theme) : defaultTheme(),
      template: typeof obj.template === "string" ? obj.template : undefined,
      title: typeof obj.title === "string" ? obj.title : undefined,
    };
  }

  // Raw ResumeData (has sections array).
  if (obj && Array.isArray(obj.sections) && obj.basics) {
    return { data: resumeDataSchema.parse(obj) };
  }

  // JSON Resume schema.
  if (obj && obj.basics && (obj.work || obj.education || obj.skills)) {
    return { data: fromJsonResume(obj) };
  }

  throw new Error("Unrecognized resume format.");
}

function id() {
  return nanoid(8);
}
function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function arr<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/** Convert JSON Resume (jsonresume.org) into our ResumeData. */
function fromJsonResume(obj: Record<string, unknown>): ResumeData {
  const base = blankResumeData();
  const b = (obj.basics ?? {}) as Record<string, unknown>;
  const loc = (b.location ?? {}) as Record<string, unknown>;

  const data: ResumeData = {
    basics: {
      fullName: str(b.name),
      headline: str(b.label),
      email: str(b.email),
      phone: str(b.phone),
      location: [str(loc.city), str(loc.region), str(loc.countryCode)]
        .filter(Boolean)
        .join(", "),
      website: str(b.url ?? b.website),
      summary: str(b.summary),
      photo: "",
      profiles: arr<Record<string, unknown>>(b.profiles).map((p) => ({
        id: id(),
        network: str(p.network),
        username: str(p.username),
        url: str(p.url),
      })),
    },
    sections: [],
  };

  const sections = data.sections;

  if (b.summary) {
    sections.push({
      id: id(),
      type: "summary",
      title: "Professional Summary",
      visible: true,
      text: str(b.summary),
      items: [],
    });
  }

  const work = arr<Record<string, unknown>>(obj.work);
  if (work.length) {
    sections.push({
      id: id(),
      type: "experience",
      title: "Work Experience",
      visible: true,
      text: "",
      items: work.map((w) => ({
        id: id(),
        company: str(w.name ?? w.company),
        position: str(w.position),
        location: str(w.location),
        startDate: str(w.startDate),
        endDate: str(w.endDate),
        current: !w.endDate,
        summary: str(w.summary),
        highlights: arr<string>(w.highlights).map(str),
      })),
    });
  }

  const education = arr<Record<string, unknown>>(obj.education);
  if (education.length) {
    sections.push({
      id: id(),
      type: "education",
      title: "Education",
      visible: true,
      text: "",
      items: education.map((e) => ({
        id: id(),
        institution: str(e.institution),
        degree: str(e.studyType),
        area: str(e.area),
        location: "",
        startDate: str(e.startDate),
        endDate: str(e.endDate),
        current: !e.endDate,
        gpa: str(e.score ?? e.gpa),
        highlights: arr<string>(e.courses).map(str),
      })),
    });
  }

  const skills = arr<Record<string, unknown>>(obj.skills);
  if (skills.length) {
    sections.push({
      id: id(),
      type: "skills",
      title: "Skills",
      visible: true,
      text: "",
      items: skills.map((s) => ({
        id: id(),
        name: str(s.name),
        level: 0,
        keywords: arr<string>(s.keywords).map(str),
      })),
    });
  }

  const projects = arr<Record<string, unknown>>(obj.projects);
  if (projects.length) {
    sections.push({
      id: id(),
      type: "projects",
      title: "Projects",
      visible: true,
      text: "",
      items: projects.map((p) => ({
        id: id(),
        name: str(p.name),
        description: str(p.description),
        url: str(p.url),
        startDate: str(p.startDate),
        endDate: str(p.endDate),
        highlights: arr<string>(p.highlights).map(str),
        keywords: arr<string>(p.keywords).map(str),
      })),
    });
  }

  return resumeDataSchema.parse({ ...base, ...data });
}

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
