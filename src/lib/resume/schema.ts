import { z } from "zod";

/**
 * The full structured content of a resume is stored as JSON in Resume.data.
 * Theme/customization is stored in Resume.theme.
 * These zod schemas are the single source of truth for both validation and types.
 */

// ----------------------------- Basics -----------------------------
export const profileSchema = z.object({
  id: z.string(),
  network: z.string().default(""), // e.g. LinkedIn, GitHub
  username: z.string().default(""),
  url: z.string().default(""),
});

export const basicsSchema = z.object({
  fullName: z.string().default(""),
  headline: z.string().default(""), // e.g. "Senior Software Engineer"
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  website: z.string().default(""),
  summary: z.string().default(""),
  photo: z.string().default(""), // data URL or remote URL
  profiles: z.array(profileSchema).default([]),
});

// ----------------------------- Section items -----------------------------
export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().default(""),
  position: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""), // YYYY-MM
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  summary: z.string().default(""),
  highlights: z.array(z.string()).default([]),
});

export const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string().default(""),
  degree: z.string().default(""),
  area: z.string().default(""), // field of study
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  gpa: z.string().default(""),
  highlights: z.array(z.string()).default([]),
});

export const skillItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""), // group name e.g. "Languages"
  level: z.number().min(0).max(5).default(0), // 0 = unset
  keywords: z.array(z.string()).default([]),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  description: z.string().default(""),
  url: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  url: z.string().default(""),
});

export const awardItemSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  awarder: z.string().default(""),
  date: z.string().default(""),
  summary: z.string().default(""),
});

export const languageItemSchema = z.object({
  id: z.string(),
  language: z.string().default(""),
  fluency: z.string().default(""), // e.g. Native, Professional
});

export const customItemSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  date: z.string().default(""),
  url: z.string().default(""),
  description: z.string().default(""),
  highlights: z.array(z.string()).default([]),
});

// ----------------------------- Sections -----------------------------
export const SECTION_TYPES = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "awards",
  "languages",
  "interests",
  "custom",
] as const;

export const sectionTypeSchema = z.enum(SECTION_TYPES);

export const sectionSchema = z.object({
  id: z.string(),
  type: sectionTypeSchema,
  title: z.string().default(""),
  visible: z.boolean().default(true),
  // For "summary" / "interests" sections the content lives in `text`.
  text: z.string().default(""),
  // For all list sections, items hold the relevant shape (loosely typed JSON,
  // validated per type at the editor layer).
  items: z.array(z.record(z.string(), z.any())).default([]),
});

export const resumeDataSchema = z.object({
  basics: basicsSchema.default(basicsSchema.parse({})),
  sections: z.array(sectionSchema).default([]),
});

// ----------------------------- Theme -----------------------------
export const FONT_FAMILIES = [
  "Inter",
  "Poppins",
  "Roboto",
  "Lato",
  "Source Sans 3",
  "IBM Plex Sans",
  "Georgia",
  "Merriweather",
  "Playfair Display",
  "Arial",
  "Times New Roman",
] as const;

export const PAGE_SIZES = {
  letter: { label: "US Letter", width: 816, height: 1056 }, // 8.5×11in @96dpi
  a4: { label: "A4", width: 794, height: 1123 }, // 210×297mm @96dpi
} as const;

export type PageSize = keyof typeof PAGE_SIZES;

export const themeSchema = z.object({
  accent: z.string().default("#2563eb"),
  fontFamily: z.string().default("Inter"),
  fontSize: z.number().min(8).max(14).default(10.5), // pt
  lineHeight: z.number().min(1).max(2).default(1.4),
  sectionSpacing: z.number().min(4).max(40).default(16), // px
  pagePadding: z.number().min(16).max(80).default(40), // px
  headingStyle: z.enum(["underline", "uppercase", "plain", "bar"]).default("bar"),
  showIcons: z.boolean().default(true),
  columns: z.enum(["one", "two"]).default("one"),
  pageSize: z.enum(["letter", "a4"]).default("letter"),
  showPhoto: z.boolean().default(true),
  photoShape: z.enum(["round", "square"]).default("round"),
  dateFormat: z.enum(["short", "numeric", "year"]).default("short"),
});

// ----------------------------- Inferred types -----------------------------
export type Profile = z.infer<typeof profileSchema>;
export type Basics = z.infer<typeof basicsSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;
export type AwardItem = z.infer<typeof awardItemSchema>;
export type LanguageItem = z.infer<typeof languageItemSchema>;
export type CustomItem = z.infer<typeof customItemSchema>;
export type SectionType = z.infer<typeof sectionTypeSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type ResumeData = z.infer<typeof resumeDataSchema>;
export type ResumeTheme = z.infer<typeof themeSchema>;

export const SECTION_META: Record<
  SectionType,
  { label: string; defaultTitle: string; kind: "text" | "list" }
> = {
  summary: { label: "Summary", defaultTitle: "Professional Summary", kind: "text" },
  experience: { label: "Experience", defaultTitle: "Work Experience", kind: "list" },
  education: { label: "Education", defaultTitle: "Education", kind: "list" },
  skills: { label: "Skills", defaultTitle: "Skills", kind: "list" },
  projects: { label: "Projects", defaultTitle: "Projects", kind: "list" },
  certifications: { label: "Certifications", defaultTitle: "Certifications", kind: "list" },
  awards: { label: "Awards", defaultTitle: "Awards & Honors", kind: "list" },
  languages: { label: "Languages", defaultTitle: "Languages", kind: "list" },
  interests: { label: "Interests", defaultTitle: "Interests", kind: "text" },
  custom: { label: "Custom", defaultTitle: "Custom Section", kind: "list" },
};
