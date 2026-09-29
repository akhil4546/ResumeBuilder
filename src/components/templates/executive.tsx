import * as React from "react";
import {
  rootStyle,
  visibleSections,
  joinContacts,
  Photo,
  type TemplateProps,
} from "./shared";
import { SectionBody } from "./section-body";

/** Refined, serif-leaning executive layout with a name band and photo. */
export function ExecutiveTemplate({ data, theme }: TemplateProps) {
  const { basics } = data;
  const sections = visibleSections(data);
  const gap = `${theme.sectionSpacing}px`;

  return (
    <div style={rootStyle(theme)}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          borderBottom: `3px double ${theme.accent}`,
          paddingBottom: "0.7em",
          marginBottom: gap,
        }}
      >
        {theme.showPhoto && basics.photo && (
          <Photo src={basics.photo} size={84} shape={theme.photoShape} />
        )}
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "2.2em",
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: "#111827",
              lineHeight: 1.05,
            }}
          >
            {basics.fullName || "Your Name"}
          </h1>
          {basics.headline && (
            <div
              style={{
                fontSize: "1.05em",
                color: theme.accent,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: "0.15em",
              }}
            >
              {basics.headline}
            </div>
          )}
          <div style={{ marginTop: "0.35em", color: "#4b5563", fontSize: "0.85em" }}>
            {joinContacts(
              [
                basics.email,
                basics.phone,
                basics.location,
                basics.website,
                ...basics.profiles.map((p) => p.url || `${p.network} ${p.username}`),
              ],
              "   |   "
            )}
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {sections.map((s) => (
          <section key={s.id}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: "0.95em",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: theme.accent,
                marginBottom: "0.4em",
              }}
            >
              {s.title}
            </h2>
            <SectionBody section={s} theme={theme} />
          </section>
        ))}
      </div>
    </div>
  );
}
