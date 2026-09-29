import * as React from "react";
import {
  rootStyle,
  visibleSections,
  joinContacts,
  type TemplateProps,
} from "./shared";
import { SectionBody } from "./section-body";

/** Minimal: left-aligned name, plain small-caps labels in a left gutter. */
export function MinimalTemplate({ data, theme }: TemplateProps) {
  const { basics } = data;
  const sections = visibleSections(data);
  const gap = `${theme.sectionSpacing}px`;

  return (
    <div style={rootStyle(theme)}>
      <header style={{ marginBottom: gap }}>
        <h1 style={{ fontSize: "1.8em", fontWeight: 700, color: "#111827" }}>
          {basics.fullName || "Your Name"}
        </h1>
        {basics.headline && (
          <div style={{ color: "#6b7280", marginTop: "0.1em" }}>{basics.headline}</div>
        )}
        <div style={{ marginTop: "0.3em", color: "#6b7280", fontSize: "0.85em" }}>
          {joinContacts([
            basics.email,
            basics.phone,
            basics.location,
            basics.website,
            ...basics.profiles.map((p) => p.url || `${p.network} ${p.username}`),
          ])}
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {sections.map((s) => (
          <section
            key={s.id}
            style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "16px" }}
          >
            <div
              style={{
                fontSize: "0.78em",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: theme.accent,
                fontWeight: 600,
                paddingTop: "0.15em",
              }}
            >
              {s.title}
            </div>
            <div>
              <SectionBody section={s} theme={theme} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
