import * as React from "react";
import {
  fontStack,
  visibleSections,
  joinContacts,
  Photo,
  type TemplateProps,
} from "./shared";
import { SectionBody } from "./section-body";

/**
 * Dense, information-rich layout for experienced candidates. Tighter spacing,
 * compact header, accent left-rule headings. Fits more on a page.
 */
export function CompactTemplate({ data, theme }: TemplateProps) {
  const { basics } = data;
  const sections = visibleSections(data);
  // Compact runs a little tighter than the configured spacing.
  const gap = `${Math.max(6, theme.sectionSpacing - 4)}px`;

  return (
    <div
      style={{
        fontFamily: fontStack(theme),
        fontSize: `${theme.fontSize}pt`,
        lineHeight: Math.max(1.2, theme.lineHeight - 0.1),
        color: "#1f2937",
        padding: `${Math.max(24, theme.pagePadding - 8)}px`,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: gap,
        }}
      >
        {theme.showPhoto && basics.photo && (
          <Photo src={basics.photo} size={64} shape={theme.photoShape} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.6em", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "1.7em", fontWeight: 800, color: "#111827" }}>
              {basics.fullName || "Your Name"}
            </h1>
            {basics.headline && (
              <span style={{ color: theme.accent, fontWeight: 600 }}>{basics.headline}</span>
            )}
          </div>
          <div style={{ color: "#4b5563", fontSize: "0.85em", marginTop: "0.1em" }}>
            {joinContacts(
              [
                basics.email,
                basics.phone,
                basics.location,
                basics.website,
                ...basics.profiles.map((p) => p.url || `${p.network} ${p.username}`),
              ],
              "  ·  "
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
                fontSize: "0.85em",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#111827",
                borderLeft: `3px solid ${theme.accent}`,
                paddingLeft: "0.5em",
                marginBottom: "0.3em",
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
