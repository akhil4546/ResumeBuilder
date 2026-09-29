import * as React from "react";
import type { Section } from "@/lib/resume/schema";
import {
  rootStyle,
  visibleSections,
  joinContacts,
  SectionHeading,
  type TemplateProps,
} from "./shared";
import { SectionBody } from "./section-body";

const SIDE_TYPES = new Set(["skills", "languages", "certifications", "interests"]);

export function ModernTemplate({ data, theme }: TemplateProps) {
  const { basics } = data;
  const sections = visibleSections(data);
  const twoCol = theme.columns === "two";

  const main = twoCol ? sections.filter((s) => !SIDE_TYPES.has(s.type)) : sections;
  const side = twoCol ? sections.filter((s) => SIDE_TYPES.has(s.type)) : [];

  const gap = `${theme.sectionSpacing}px`;

  const renderSection = (s: Section) => (
    <section key={s.id}>
      <SectionHeading theme={theme}>{s.title}</SectionHeading>
      <SectionBody section={s} theme={theme} />
    </section>
  );

  return (
    <div style={rootStyle(theme)}>
      {/* Header */}
      <header style={{ marginBottom: gap }}>
        <h1 style={{ fontSize: "2em", fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>
          {basics.fullName || "Your Name"}
        </h1>
        {basics.headline && (
          <div style={{ fontSize: "1.05em", color: theme.accent, fontWeight: 600, marginTop: "0.1em" }}>
            {basics.headline}
          </div>
        )}
        <div style={{ marginTop: "0.4em", color: "#4b5563", fontSize: "0.9em" }}>
          {joinContacts([
            basics.email,
            basics.phone,
            basics.location,
            basics.website,
            ...basics.profiles.map((p) => p.url || `${p.network} ${p.username}`),
          ])}
        </div>
      </header>

      {twoCol ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1fr", gap: `${gap} 28px` }}>
          <div style={{ display: "flex", flexDirection: "column", gap }}>
            {main.map(renderSection)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap }}>
            {side.map(renderSection)}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap }}>
          {sections.map(renderSection)}
        </div>
      )}
    </div>
  );
}
