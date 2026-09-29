import { nanoid } from "nanoid";
import {
  basicsSchema,
  themeSchema,
  SECTION_META,
  type ResumeData,
  type ResumeTheme,
  type Section,
  type SectionType,
} from "./schema";

export function defaultTheme(): ResumeTheme {
  return themeSchema.parse({});
}

function newSection(type: SectionType): Section {
  return {
    id: nanoid(8),
    type,
    title: SECTION_META[type].defaultTitle,
    visible: true,
    text: "",
    items: [],
  };
}

/** A blank resume with the common starter sections. */
export function blankResumeData(): ResumeData {
  return {
    basics: basicsSchema.parse({}),
    sections: [
      newSection("summary"),
      newSection("experience"),
      newSection("education"),
      newSection("skills"),
    ],
  };
}

export function newSectionOfType(type: SectionType): Section {
  return newSection(type);
}

/** Create a blank item for a given section type, with a fresh id. */
export function blankItem(type: SectionType): Record<string, unknown> {
  const id = nanoid(8);
  switch (type) {
    case "experience":
      return { id, company: "", position: "", location: "", startDate: "", endDate: "", current: false, summary: "", highlights: [] };
    case "education":
      return { id, institution: "", degree: "", area: "", location: "", startDate: "", endDate: "", current: false, gpa: "", highlights: [] };
    case "skills":
      return { id, name: "", level: 0, keywords: [] };
    case "projects":
      return { id, name: "", description: "", url: "", startDate: "", endDate: "", highlights: [], keywords: [] };
    case "certifications":
      return { id, name: "", issuer: "", date: "", url: "" };
    case "awards":
      return { id, title: "", awarder: "", date: "", summary: "" };
    case "languages":
      return { id, language: "", fluency: "" };
    case "custom":
    default:
      return { id, title: "", subtitle: "", date: "", url: "", description: "", highlights: [] };
  }
}

/** A populated sample used for the "Start with example" flow and previews. */
export function sampleResumeData(): ResumeData {
  return {
    basics: {
      fullName: "Alex Morgan",
      headline: "Senior Software Engineer",
      email: "alex.morgan@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "alexmorgan.dev",
      summary:
        "Senior software engineer with 8+ years building scalable web platforms. Specializes in TypeScript, distributed systems, and developer tooling, with a track record of shipping products used by millions.",
      photo: "",
      profiles: [
        { id: nanoid(8), network: "LinkedIn", username: "alexmorgan", url: "linkedin.com/in/alexmorgan" },
        { id: nanoid(8), network: "GitHub", username: "alexmorgan", url: "github.com/alexmorgan" },
      ],
    },
    sections: [
      {
        id: nanoid(8),
        type: "summary",
        title: "Professional Summary",
        visible: true,
        text:
          "Engineer-leader who pairs strong fundamentals with product sense. I enjoy turning ambiguous problems into reliable systems and mentoring teams toward a high bar.",
        items: [],
      },
      {
        id: nanoid(8),
        type: "experience",
        title: "Work Experience",
        visible: true,
        text: "",
        items: [
          {
            id: nanoid(8),
            company: "Vercel",
            position: "Senior Software Engineer",
            location: "Remote",
            startDate: "2021-03",
            endDate: "",
            current: true,
            summary: "",
            highlights: [
              "Led the rewrite of the build pipeline, cutting average deploy time by 43%.",
              "Owned the edge-config product from prototype to GA, now used by 20k+ teams.",
              "Mentored 5 engineers; established the team's testing and on-call standards.",
            ],
          },
          {
            id: nanoid(8),
            company: "Stripe",
            position: "Software Engineer",
            location: "San Francisco, CA",
            startDate: "2017-06",
            endDate: "2021-02",
            current: false,
            summary: "",
            highlights: [
              "Built fraud-detection tooling that reduced chargebacks by 18%.",
              "Scaled the dashboard's data layer to handle 10x traffic growth.",
            ],
          },
        ],
      },
      {
        id: nanoid(8),
        type: "education",
        title: "Education",
        visible: true,
        text: "",
        items: [
          {
            id: nanoid(8),
            institution: "University of California, Berkeley",
            degree: "B.S.",
            area: "Computer Science",
            location: "Berkeley, CA",
            startDate: "2013-08",
            endDate: "2017-05",
            current: false,
            gpa: "3.8",
            highlights: [],
          },
        ],
      },
      {
        id: nanoid(8),
        type: "skills",
        title: "Skills",
        visible: true,
        text: "",
        items: [
          { id: nanoid(8), name: "Languages", level: 0, keywords: ["TypeScript", "Go", "Python", "SQL"] },
          { id: nanoid(8), name: "Frameworks", level: 0, keywords: ["React", "Next.js", "Node.js", "Prisma"] },
          { id: nanoid(8), name: "Infrastructure", level: 0, keywords: ["AWS", "Docker", "PostgreSQL", "Kafka"] },
        ],
      },
      {
        id: nanoid(8),
        type: "projects",
        title: "Projects",
        visible: true,
        text: "",
        items: [
          {
            id: nanoid(8),
            name: "OpenResume",
            description: "Open-source resume builder with 12k GitHub stars.",
            url: "github.com/alexmorgan/openresume",
            startDate: "",
            endDate: "",
            highlights: ["Built the PDF rendering engine used by the project."],
            keywords: ["TypeScript", "React"],
          },
        ],
      },
    ],
  };
}
