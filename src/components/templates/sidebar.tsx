import * as React from "react";
import { PAGE_SIZES, type Section } from "@/lib/resume/schema";
import { formatDate } from "@/lib/utils";
import {
  fontStack,
  visibleSections,
  Photo,
  asSkill,
  asLanguage,
  asCertification,
  SectionHeading,
  type TemplateProps,
} from "./shared";
import { SectionBody } from "./section-body";

const SIDE_TYPES = new Set(["skills", "languages", "certifications", "interests"]);

/** Two-tone template with a colored sidebar (contact, skills, languages). */
export function SidebarTemplate({ data, theme }: TemplateProps) {
  const { basics } = data;
  const sections = visibleSections(data);
  const main = sections.filter((s) => !SIDE_TYPES.has(s.type));
  const side = sections.filter((s) => SIDE_TYPES.has(s.type));
  const gap = `${theme.sectionSpacing}px`;
  const pageHeight = PAGE_SIZES[theme.pageSize].height;

  const sideHeading = (text: string) => (
    <div
      style={{
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontSize: "0.78em",
        fontWeight: 700,
        opacity: 0.9,
        marginBottom: "0.4em",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
        paddingBottom: "0.2em",
      }}
    >
      {text}
    </div>
  );

  const contactLines = [
    basics.email,
    basics.phone,
    basics.location,
    basics.website,
    ...basics.profiles.map((p) => p.url || `${p.network}: ${p.username}`),
  ].filter((x) => x && x.trim());

  return (
    <div
      style={{
        display: "flex",
        minHeight: pageHeight,
        fontFamily: fontStack(theme),
        fontSize: `${theme.fontSize}pt`,
        lineHeight: theme.lineHeight,
        color: "#1f2937",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "34%",
          background: theme.accent,
          color: "white",
          padding: `${theme.pagePadding}px 20px`,
          display: "flex",
          flexDirection: "column",
          gap,
        }}
      >
        {theme.showPhoto && basics.photo && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Photo src={basics.photo} size={120} shape={theme.photoShape} ring="rgba(255,255,255,0.6)" />
          </div>
        )}

        {contactLines.length > 0 && (
          <div>
            {sideHeading("Contact")}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25em", fontSize: "0.9em", wordBreak: "break-word" }}>
              {contactLines.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {side.map((s) => (
          <div key={s.id}>
            {sideHeading(s.title)}
            <SideSection section={s} dateFormat={theme.dateFormat} />
          </div>
        ))}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: `${theme.pagePadding}px 28px`, minWidth: 0 }}>
        <header style={{ marginBottom: gap }}>
          <h1 style={{ fontSize: "2em", fontWeight: 800, lineHeight: 1.1, color: "#111827" }}>
            {basics.fullName || "Your Name"}
          </h1>
          {basics.headline && (
            <div style={{ fontSize: "1.05em", color: theme.accent, fontWeight: 600, marginTop: "0.1em" }}>
              {basics.headline}
            </div>
          )}
        </header>
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          {main.map((s) => (
            <section key={s.id}>
              <SectionHeading theme={theme}>{s.title}</SectionHeading>
              <SectionBody section={s} theme={theme} />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

/** Light-on-accent rendering for the limited set of sidebar section types. */
function SideSection({
  section,
  dateFormat,
}: {
  section: Section;
  dateFormat: "short" | "numeric" | "year";
}) {
  if (section.type === "interests") {
    return <p style={{ margin: 0, fontSize: "0.9em" }}>{section.text}</p>;
  }
  if (section.type === "skills") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", fontSize: "0.9em" }}>
        {section.items.map(asSkill).map((it) => (
          <div key={it.id}>
            {it.name && <div style={{ fontWeight: 600 }}>{it.name}</div>}
            <div style={{ opacity: 0.9 }}>{it.keywords.join(" · ")}</div>
          </div>
        ))}
      </div>
    );
  }
  if (section.type === "languages") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25em", fontSize: "0.9em" }}>
        {section.items.map(asLanguage).map((it) => (
          <div key={it.id}>
            <span style={{ fontWeight: 600 }}>{it.language}</span>
            {it.fluency ? <span style={{ opacity: 0.85 }}> — {it.fluency}</span> : null}
          </div>
        ))}
      </div>
    );
  }
  // certifications
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4em", fontSize: "0.9em" }}>
      {section.items.map(asCertification).map((it) => (
        <div key={it.id}>
          <div style={{ fontWeight: 600 }}>{it.name}</div>
          <div style={{ opacity: 0.85 }}>
            {[it.issuer, formatDate(it.date, dateFormat)].filter(Boolean).join(" · ")}
          </div>
        </div>
      ))}
    </div>
  );
}
