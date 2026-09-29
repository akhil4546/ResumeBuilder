import * as React from "react";
import type { ResumeTheme, Section } from "@/lib/resume/schema";
import { formatDateRange } from "@/lib/utils";
import {
  rootStyle,
  visibleSections,
  joinContacts,
  Bullets,
  Photo,
  asExperience,
  asEducation,
  SectionHeading,
  type TemplateProps,
} from "./shared";
import { SectionBody } from "./section-body";

/** Experience/education shown on an accent timeline rail. */
export function TimelineTemplate({ data, theme }: TemplateProps) {
  const { basics } = data;
  const sections = visibleSections(data);
  const gap = `${theme.sectionSpacing}px`;

  return (
    <div style={rootStyle(theme)}>
      <header style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: gap }}>
        {theme.showPhoto && basics.photo && (
          <Photo src={basics.photo} size={78} shape={theme.photoShape} ring={theme.accent} />
        )}
        <div>
          <h1 style={{ fontSize: "2em", fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>
            {basics.fullName || "Your Name"}
          </h1>
          {basics.headline && (
            <div style={{ fontSize: "1.05em", color: theme.accent, fontWeight: 600 }}>
              {basics.headline}
            </div>
          )}
          <div style={{ marginTop: "0.3em", color: "#4b5563", fontSize: "0.85em" }}>
            {joinContacts([
              basics.email,
              basics.phone,
              basics.location,
              basics.website,
              ...basics.profiles.map((p) => p.url || `${p.network} ${p.username}`),
            ])}
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {sections.map((s) => (
          <section key={s.id}>
            <SectionHeading theme={theme}>{s.title}</SectionHeading>
            {s.type === "experience" || s.type === "education" ? (
              <TimelineSection section={s} theme={theme} />
            ) : (
              <SectionBody section={s} theme={theme} />
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function TimelineSection({ section, theme }: { section: Section; theme: ResumeTheme }) {
  const df = theme.dateFormat;
  const rows =
    section.type === "experience"
      ? section.items.map(asExperience).map((it) => ({
          id: it.id,
          title: [it.position, it.company].filter(Boolean).join(", "),
          meta: it.location,
          range: formatDateRange(it.startDate, it.endDate, it.current, df),
          summary: it.summary,
          highlights: it.highlights,
        }))
      : section.items.map(asEducation).map((it) => ({
          id: it.id,
          title: it.institution,
          meta: [it.degree, it.area].filter(Boolean).join(", ") + (it.gpa ? ` · GPA ${it.gpa}` : ""),
          range: formatDateRange(it.startDate, it.endDate, it.current, df),
          summary: "",
          highlights: it.highlights,
        }));

  return (
    <div
      style={{
        borderLeft: `2px solid ${theme.accent}33`,
        marginLeft: "5px",
        paddingLeft: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "0.7em",
      }}
    >
      {rows.map((r) => (
        <div key={r.id} style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "-21px",
              top: "0.35em",
              width: "9px",
              height: "9px",
              borderRadius: "9999px",
              background: theme.accent,
              boxShadow: "0 0 0 2px white",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1em", alignItems: "baseline" }}>
            <span style={{ fontWeight: 600 }}>{r.title}</span>
            <span style={{ color: "#6b7280", whiteSpace: "nowrap" }}>{r.range}</span>
          </div>
          {r.meta && <div style={{ color: "#6b7280", fontStyle: "italic" }}>{r.meta}</div>}
          {r.summary && <p style={{ margin: "0.2em 0 0" }}>{r.summary}</p>}
          <Bullets items={r.highlights} />
        </div>
      ))}
    </div>
  );
}
