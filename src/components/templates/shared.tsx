import * as React from "react";
import type {
  ResumeData,
  ResumeTheme,
  Section,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  AwardItem,
  LanguageItem,
  CustomItem,
} from "@/lib/resume/schema";

export type TemplateProps = {
  data: ResumeData;
  theme: ResumeTheme;
};

export const FONT_STACKS: Record<string, string> = {
  Inter: "var(--font-template-inter)",
  Poppins: "var(--font-template-poppins)",
  Roboto: "var(--font-template-roboto)",
  Lato: "var(--font-template-lato)",
  "Source Sans 3": "var(--font-template-source)",
  "IBM Plex Sans": "var(--font-template-ibm)",
  Merriweather: "var(--font-template-merriweather)",
  "Playfair Display": "var(--font-template-playfair)",
  Georgia: "Georgia, 'Times New Roman', serif",
  Arial: "Arial, Helvetica, sans-serif",
  "Times New Roman": "'Times New Roman', Times, serif",
};

export function fontStack(theme: ResumeTheme): string {
  return FONT_STACKS[theme.fontFamily] ?? FONT_STACKS.Inter;
}

/** Photo avatar honoring theme shape. Returns null when nothing to show. */
export function Photo({
  src,
  size,
  shape,
  ring,
}: {
  src?: string;
  size: number;
  shape: "round" | "square";
  ring?: string;
}) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: shape === "round" ? "9999px" : "8px",
        border: ring ? `3px solid ${ring}` : undefined,
        flexShrink: 0,
      }}
    />
  );
}

/** Root styles shared by all templates, derived from the theme. */
export function rootStyle(theme: ResumeTheme): React.CSSProperties {
  return {
    fontFamily: fontStack(theme),
    fontSize: `${theme.fontSize}pt`,
    lineHeight: theme.lineHeight,
    padding: `${theme.pagePadding}px`,
    color: "#1f2937",
  };
}

export function visibleSections(data: ResumeData): Section[] {
  return data.sections.filter((s) => {
    if (!s.visible) return false;
    if (s.type === "summary" || s.type === "interests") return s.text.trim().length > 0;
    return s.items.length > 0;
  });
}

// Typed item accessors (items are stored loosely as JSON).
export const asExperience = (i: Record<string, unknown>) => i as unknown as ExperienceItem;
export const asEducation = (i: Record<string, unknown>) => i as unknown as EducationItem;
export const asSkill = (i: Record<string, unknown>) => i as unknown as SkillItem;
export const asProject = (i: Record<string, unknown>) => i as unknown as ProjectItem;
export const asCertification = (i: Record<string, unknown>) => i as unknown as CertificationItem;
export const asAward = (i: Record<string, unknown>) => i as unknown as AwardItem;
export const asLanguage = (i: Record<string, unknown>) => i as unknown as LanguageItem;
export const asCustom = (i: Record<string, unknown>) => i as unknown as CustomItem;

/** A heading whose styling honors theme.headingStyle. */
export function SectionHeading({
  theme,
  children,
}: {
  theme: ResumeTheme;
  children: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    fontWeight: 700,
    fontSize: "1.05em",
    marginBottom: "0.35em",
    color: "#111827",
  };
  switch (theme.headingStyle) {
    case "uppercase":
      return (
        <h2 style={{ ...base, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.95em" }}>
          {children}
        </h2>
      );
    case "underline":
      return (
        <h2 style={{ ...base, borderBottom: "1px solid #d1d5db", paddingBottom: "0.15em" }}>
          {children}
        </h2>
      );
    case "bar":
      return (
        <h2
          style={{
            ...base,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontSize: "0.9em",
            borderBottom: `2px solid ${theme.accent}`,
            paddingBottom: "0.2em",
            color: theme.accent,
          }}
        >
          {children}
        </h2>
      );
    default:
      return <h2 style={base}>{children}</h2>;
  }
}

export function Bullets({ items }: { items: string[] }) {
  const list = items.filter((x) => x && x.trim().length > 0);
  if (list.length === 0) return null;
  return (
    <ul style={{ margin: "0.25em 0 0", paddingLeft: "1.1em", listStyleType: "disc" }}>
      {list.map((b, i) => (
        <li key={i} data-break style={{ marginBottom: "0.15em" }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

/** Contact line joined with separators, skipping blanks. */
export function joinContacts(parts: (string | undefined | null)[], sep = "  •  ") {
  return parts.filter((p) => p && p.trim().length > 0).join(sep);
}
