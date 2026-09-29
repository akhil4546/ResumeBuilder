import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";
import type { ResumeData, ResumeTheme, Section } from "./schema";
import { formatDateRange, formatDate, type DateFormat } from "@/lib/utils";
import {
  asExperience,
  asEducation,
  asSkill,
  asProject,
  asCertification,
  asAward,
  asLanguage,
  asCustom,
} from "@/components/templates/shared";

function heading(text: string, accentHex: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 80 },
    border: {
      bottom: { color: accentHex.replace("#", ""), size: 6, style: BorderStyle.SINGLE, space: 1 },
    },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: "222222" }),
    ],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 20 })],
  });
}

function line(runs: TextRun[], opts?: { after?: number }): Paragraph {
  return new Paragraph({ spacing: { after: opts?.after ?? 20 }, children: runs });
}

function sectionParagraphs(section: Section, accent: string, df: DateFormat): Paragraph[] {
  const out: Paragraph[] = [heading(section.title, accent)];

  switch (section.type) {
    case "summary":
    case "interests":
      out.push(line([new TextRun({ text: section.text, size: 20 })], { after: 60 }));
      break;

    case "experience":
      for (const it of section.items.map(asExperience)) {
        out.push(
          line(
            [
              new TextRun({ text: `${it.position}`, bold: true, size: 20 }),
              new TextRun({ text: it.company ? `, ${it.company}` : "", size: 20 }),
              new TextRun({
                text: `\t${formatDateRange(it.startDate, it.endDate, it.current, df)}`,
                size: 18,
                color: "666666",
              }),
            ],
            { after: 0 }
          )
        );
        if (it.location)
          out.push(line([new TextRun({ text: it.location, italics: true, size: 18, color: "666666" })]));
        for (const h of it.highlights.filter(Boolean)) out.push(bullet(h));
      }
      break;

    case "education":
      for (const it of section.items.map(asEducation)) {
        out.push(
          line([
            new TextRun({ text: it.institution, bold: true, size: 20 }),
            new TextRun({
              text: `\t${formatDateRange(it.startDate, it.endDate, it.current, df)}`,
              size: 18,
              color: "666666",
            }),
          ])
        );
        out.push(
          line([
            new TextRun({
              text: [it.degree, it.area].filter(Boolean).join(", ") + (it.gpa ? ` · GPA ${it.gpa}` : ""),
              size: 20,
            }),
          ])
        );
        for (const h of it.highlights.filter(Boolean)) out.push(bullet(h));
      }
      break;

    case "skills":
      for (const it of section.items.map(asSkill)) {
        out.push(
          line([
            new TextRun({ text: it.name ? `${it.name}: ` : "", bold: true, size: 20 }),
            new TextRun({ text: it.keywords.join(", "), size: 20 }),
          ])
        );
      }
      break;

    case "projects":
      for (const it of section.items.map(asProject)) {
        out.push(
          line([
            new TextRun({ text: it.name, bold: true, size: 20 }),
            new TextRun({ text: it.url ? ` · ${it.url}` : "", size: 18, color: "666666" }),
          ])
        );
        if (it.description) out.push(line([new TextRun({ text: it.description, size: 20 })]));
        for (const h of it.highlights.filter(Boolean)) out.push(bullet(h));
      }
      break;

    case "certifications":
      for (const it of section.items.map(asCertification)) {
        out.push(
          line([
            new TextRun({ text: it.name, bold: true, size: 20 }),
            new TextRun({ text: it.issuer ? ` — ${it.issuer}` : "", size: 20 }),
            new TextRun({ text: it.date ? `\t${formatDate(it.date, df)}` : "", size: 18, color: "666666" }),
          ])
        );
      }
      break;

    case "awards":
      for (const it of section.items.map(asAward)) {
        out.push(
          line([
            new TextRun({ text: it.title, bold: true, size: 20 }),
            new TextRun({ text: it.awarder ? ` — ${it.awarder}` : "", size: 20 }),
            new TextRun({ text: it.date ? `\t${formatDate(it.date, df)}` : "", size: 18, color: "666666" }),
          ])
        );
        if (it.summary) out.push(line([new TextRun({ text: it.summary, size: 20 })]));
      }
      break;

    case "languages":
      out.push(
        line([
          new TextRun({
            text: section.items
              .map(asLanguage)
              .map((l) => l.language + (l.fluency ? ` (${l.fluency})` : ""))
              .join(", "),
            size: 20,
          }),
        ])
      );
      break;

    case "custom":
    default:
      for (const it of section.items.map(asCustom)) {
        out.push(
          line([
            new TextRun({ text: it.title, bold: true, size: 20 }),
            new TextRun({ text: it.date ? `\t${formatDate(it.date, df)}` : "", size: 18, color: "666666" }),
          ])
        );
        if (it.subtitle) out.push(line([new TextRun({ text: it.subtitle, italics: true, size: 18 })]));
        if (it.description) out.push(line([new TextRun({ text: it.description, size: 20 })]));
        for (const h of it.highlights.filter(Boolean)) out.push(bullet(h));
      }
      break;
  }
  return out;
}

export async function buildDocx(data: ResumeData, theme: ResumeTheme): Promise<Buffer> {
  const { basics } = data;
  const accent = theme.accent || "#2563eb";

  const contactParts = [
    basics.email,
    basics.phone,
    basics.location,
    basics.website,
    ...basics.profiles.map((p) => p.url || `${p.network} ${p.username}`),
  ].filter((p) => p && p.trim());

  const header: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: basics.fullName || "Your Name", bold: true, size: 40 })],
    }),
  ];
  if (basics.headline) {
    header.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: basics.headline, size: 24, color: accent.replace("#", "") })],
      })
    );
  }
  if (contactParts.length) {
    header.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: contactParts.join("  •  "), size: 18, color: "555555" })],
      })
    );
  }

  const body = data.sections
    .filter((s) => {
      if (!s.visible) return false;
      if (s.type === "summary" || s.type === "interests") return s.text.trim().length > 0;
      return s.items.length > 0;
    })
    .flatMap((s) => sectionParagraphs(s, accent, theme.dateFormat));

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri" } },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        children: [...header, ...body],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
