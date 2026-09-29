import * as React from "react";
import type { ResumeTheme, Section } from "@/lib/resume/schema";
import { formatDateRange, formatDate } from "@/lib/utils";
import {
  Bullets,
  asExperience,
  asEducation,
  asSkill,
  asProject,
  asCertification,
  asAward,
  asLanguage,
  asCustom,
} from "./shared";

const rowHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "1em",
  alignItems: "baseline",
};
const subtle: React.CSSProperties = { color: "#6b7280", whiteSpace: "nowrap" };

/** Renders the inner content of a section (no heading). Shared by templates. */
export function SectionBody({
  section,
  theme,
}: {
  section: Section;
  theme: ResumeTheme;
}) {
  const df = theme.dateFormat;
  switch (section.type) {
    case "summary":
    case "interests":
      return <p style={{ margin: 0 }}>{section.text}</p>;

    case "experience":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7em" }}>
          {section.items.map(asExperience).map((it) => (
            <div key={it.id} data-break>
              <div style={rowHeader}>
                <span style={{ fontWeight: 600 }}>
                  {it.position}
                  {it.position && it.company ? ", " : ""}
                  <span style={{ color: theme.accent }}>{it.company}</span>
                </span>
                <span style={subtle}>
                  {formatDateRange(it.startDate, it.endDate, it.current, df)}
                </span>
              </div>
              {it.location && (
                <div style={{ ...subtle, fontStyle: "italic" }}>{it.location}</div>
              )}
              {it.summary && <p style={{ margin: "0.2em 0 0" }}>{it.summary}</p>}
              <Bullets items={it.highlights} />
            </div>
          ))}
        </div>
      );

    case "education":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
          {section.items.map(asEducation).map((it) => (
            <div key={it.id} data-break>
              <div style={rowHeader}>
                <span style={{ fontWeight: 600 }}>{it.institution}</span>
                <span style={subtle}>
                  {formatDateRange(it.startDate, it.endDate, it.current, df)}
                </span>
              </div>
              <div style={rowHeader}>
                <span>
                  {[it.degree, it.area].filter(Boolean).join(", ")}
                  {it.gpa ? ` · GPA ${it.gpa}` : ""}
                </span>
                {it.location && <span style={subtle}>{it.location}</span>}
              </div>
              <Bullets items={it.highlights} />
            </div>
          ))}
        </div>
      );

    case "skills":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3em" }}>
          {section.items.map(asSkill).map((it) => (
            <div key={it.id} data-break>
              {it.name && <span style={{ fontWeight: 600 }}>{it.name}: </span>}
              <span>{it.keywords.join(", ")}</span>
            </div>
          ))}
        </div>
      );

    case "projects":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
          {section.items.map(asProject).map((it) => (
            <div key={it.id} data-break>
              <div style={rowHeader}>
                <span style={{ fontWeight: 600 }}>
                  {it.name}
                  {it.url && (
                    <span style={{ ...subtle, fontWeight: 400 }}> · {it.url}</span>
                  )}
                </span>
                <span style={subtle}>
                  {formatDateRange(it.startDate, it.endDate, false, df)}
                </span>
              </div>
              {it.description && <p style={{ margin: "0.2em 0 0" }}>{it.description}</p>}
              <Bullets items={it.highlights} />
              {it.keywords.length > 0 && (
                <div style={{ ...subtle, marginTop: "0.2em" }}>
                  {it.keywords.join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case "certifications":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35em" }}>
          {section.items.map(asCertification).map((it) => (
            <div key={it.id} style={rowHeader} data-break>
              <span>
                <span style={{ fontWeight: 600 }}>{it.name}</span>
                {it.issuer ? ` — ${it.issuer}` : ""}
              </span>
              <span style={subtle}>{formatDate(it.date, df)}</span>
            </div>
          ))}
        </div>
      );

    case "awards":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45em" }}>
          {section.items.map(asAward).map((it) => (
            <div key={it.id} data-break>
              <div style={rowHeader}>
                <span>
                  <span style={{ fontWeight: 600 }}>{it.title}</span>
                  {it.awarder ? ` — ${it.awarder}` : ""}
                </span>
                <span style={subtle}>{formatDate(it.date, df)}</span>
              </div>
              {it.summary && <p style={{ margin: "0.15em 0 0" }}>{it.summary}</p>}
            </div>
          ))}
        </div>
      );

    case "languages":
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em 1.2em" }}>
          {section.items.map(asLanguage).map((it) => (
            <span key={it.id} data-break>
              <span style={{ fontWeight: 600 }}>{it.language}</span>
              {it.fluency ? ` — ${it.fluency}` : ""}
            </span>
          ))}
        </div>
      );

    case "custom":
    default:
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
          {section.items.map(asCustom).map((it) => (
            <div key={it.id} data-break>
              <div style={rowHeader}>
                <span style={{ fontWeight: 600 }}>{it.title}</span>
                <span style={subtle}>{formatDate(it.date, df)}</span>
              </div>
              {it.subtitle && (
                <div style={{ ...subtle, fontStyle: "italic" }}>{it.subtitle}</div>
              )}
              {it.description && <p style={{ margin: "0.2em 0 0" }}>{it.description}</p>}
              <Bullets items={it.highlights} />
            </div>
          ))}
        </div>
      );
  }
}
