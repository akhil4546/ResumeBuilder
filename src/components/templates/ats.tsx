import * as React from "react";
import {
  rootStyle,
  visibleSections,
  joinContacts,
  type TemplateProps,
} from "./shared";
import { SectionBody } from "./section-body";

/**
 * ATS: maximally parseable. Single column, no color, plain headings,
 * standard section labels. Designed to survive resume parsers.
 */
export function AtsTemplate({ data, theme }: TemplateProps) {
  const { basics } = data;
  const sections = visibleSections(data);
  const gap = `${theme.sectionSpacing}px`;
  // Force neutral color for ATS regardless of accent.
  const plainTheme = { ...theme, accent: "#000000", headingStyle: "uppercase" as const };

  return (
    <div style={{ ...rootStyle(theme), color: "#000" }}>
      <header style={{ marginBottom: gap }}>
        <h1 style={{ fontSize: "1.7em", fontWeight: 700 }}>
          {basics.fullName || "Your Name"}
        </h1>
        {basics.headline && <div>{basics.headline}</div>}
        <div style={{ marginTop: "0.2em", fontSize: "0.9em" }}>
          {joinContacts(
            [
              basics.email,
              basics.phone,
              basics.location,
              basics.website,
              ...basics.profiles.map((p) => p.url || `${p.network} ${p.username}`),
            ],
            " | "
          )}
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {sections.map((s) => (
          <section key={s.id}>
            <h2
              style={{
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "0.95em",
                marginBottom: "0.3em",
                borderBottom: "1px solid #000",
                paddingBottom: "0.1em",
              }}
            >
              {s.title}
            </h2>
            <SectionBody section={s} theme={plainTheme} />
          </section>
        ))}
      </div>
    </div>
  );
}
