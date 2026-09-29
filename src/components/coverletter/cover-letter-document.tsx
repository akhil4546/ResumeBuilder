import * as React from "react";
import type { CoverLetterData } from "@/lib/coverletter/schema";
import { FONT_STACKS } from "@/components/templates/shared";

export function CoverLetterDocument({
  data,
  className,
}: {
  data: CoverLetterData;
  className?: string;
}) {
  const font = FONT_STACKS[data.fontFamily] ?? FONT_STACKS.Inter;
  const paragraphs = data.body.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  const contact = [data.senderEmail, data.senderPhone, data.senderLocation]
    .filter(Boolean)
    .join("  •  ");

  return (
    <div
      className={`resume-page ${className ?? ""}`}
      style={{
        fontFamily: font,
        fontSize: `${data.fontSize}pt`,
        lineHeight: 1.5,
        color: "#1f2937",
        padding: "64px",
      }}
    >
      {/* Letterhead */}
      <header style={{ marginBottom: "1.6em" }}>
        <div style={{ fontSize: "1.6em", fontWeight: 700, color: data.accent }}>
          {data.senderName || "Your Name"}
        </div>
        {contact && (
          <div style={{ color: "#6b7280", fontSize: "0.85em", marginTop: "0.2em" }}>
            {contact}
          </div>
        )}
      </header>

      {data.date && <div style={{ marginBottom: "1.4em" }}>{data.date}</div>}

      {(data.recipientName || data.company || data.recipientTitle || data.companyAddress) && (
        <div style={{ marginBottom: "1.4em" }}>
          {data.recipientName && <div>{data.recipientName}</div>}
          {data.recipientTitle && <div>{data.recipientTitle}</div>}
          {data.company && <div>{data.company}</div>}
          {data.companyAddress && (
            <div style={{ whiteSpace: "pre-line" }}>{data.companyAddress}</div>
          )}
        </div>
      )}

      {data.greeting && <p style={{ margin: "0 0 1em" }}>{data.greeting}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
        {paragraphs.length > 0 ? (
          paragraphs.map((p, i) => (
            <p key={i} style={{ margin: 0, whiteSpace: "pre-line" }}>
              {p}
            </p>
          ))
        ) : (
          <p style={{ margin: 0, color: "#9ca3af" }}>
            Your letter body will appear here…
          </p>
        )}
      </div>

      <div style={{ marginTop: "1.6em" }}>
        <div>{data.closing}</div>
        <div style={{ marginTop: "1.4em", fontWeight: 600 }}>
          {data.signature || data.senderName}
        </div>
      </div>
    </div>
  );
}
