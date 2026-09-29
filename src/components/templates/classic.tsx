import * as React from "react";
import {
  rootStyle,
  visibleSections,
  joinContacts,
  type TemplateProps,
} from "./shared";
import { SectionBody } from "./section-body";

/** Classic centered header with serif-leaning, underline headings. */
export function ClassicTemplate({ data, theme }: TemplateProps) {
  const { basics } = data;
  const sections = visibleSections(data);
  const gap = `${theme.sectionSpacing}px`;

  return (
    <div style={rootStyle(theme)}>
      <header style={{ textAlign: "center", marginBottom: gap }}>
        <h1
          style={{
            fontSize: "2.1em",
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "#111827",
          }}
        >
          {basics.fullName || "Your Name"}
        </h1>
        {basics.headline && (
          <div style={{ fontSize: "1em", color: "#374151", marginTop: "0.15em" }}>
            {basics.headline}
          </div>
        )}
        <div style={{ marginTop: "0.4em", color: "#4b5563", fontSize: "0.88em" }}>
          {joinContacts(
            [
              basics.email,
              basics.phone,
              basics.location,
              basics.website,
              ...basics.profiles.map((p) => p.url || `${p.network} ${p.username}`),
            ],
            "  |  "
          )}
        </div>
        <div
          style={{
            marginTop: "0.6em",
            borderBottom: "2px solid #111827",
            width: "100%",
          }}
        />
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {sections.map((s) => (
          <section key={s.id}>
            <h2
              style={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "0.92em",
                borderBottom: "1px solid #9ca3af",
                paddingBottom: "0.15em",
                marginBottom: "0.4em",
                color: "#111827",
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
