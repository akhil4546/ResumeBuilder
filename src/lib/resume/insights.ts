import type { ResumeData } from "./schema";
import {
  asExperience,
  asEducation,
  asSkill,
} from "@/components/templates/shared";

export type Check = {
  id: string;
  label: string;
  passed: boolean;
  hint?: string;
};

export type Insights = {
  score: number; // 0..100
  checks: Check[];
  passedCount: number;
};

const QUANTIFY = /\d|%|\$|\bk\b|million|thousand/i;
const WEAK_VERBS = ["responsible for", "worked on", "helped with", "duties included"];

export function computeInsights(data: ResumeData): Insights {
  const { basics, sections } = data;

  const experience = sections.find((s) => s.type === "experience");
  const expItems = experience ? experience.items.map(asExperience) : [];
  const allHighlights = expItems.flatMap((e) => e.highlights).filter(Boolean);

  const education = sections.find((s) => s.type === "education");
  const eduItems = education ? education.items.map(asEducation) : [];

  const skills = sections.find((s) => s.type === "skills");
  const skillCount = skills
    ? skills.items.map(asSkill).reduce((n, s) => n + s.keywords.length, 0)
    : 0;

  const summarySection = sections.find((s) => s.type === "summary");
  const summaryText = (summarySection?.text || basics.summary || "").trim();

  const quantified = allHighlights.filter((h) => QUANTIFY.test(h)).length;
  const hasWeak = allHighlights.some((h) =>
    WEAK_VERBS.some((w) => h.toLowerCase().includes(w))
  );

  const checks: Check[] = [
    {
      id: "name",
      label: "Name and headline filled in",
      passed: Boolean(basics.fullName.trim() && basics.headline.trim()),
      hint: "Add your name and a professional headline.",
    },
    {
      id: "contact",
      label: "Email and phone provided",
      passed: Boolean(basics.email.trim() && basics.phone.trim()),
      hint: "Recruiters need a way to reach you.",
    },
    {
      id: "links",
      label: "At least one profile link",
      passed: basics.profiles.some((p) => p.url.trim()),
      hint: "Add a LinkedIn or portfolio link.",
    },
    {
      id: "summary",
      label: "Summary is 200–600 characters",
      passed: summaryText.length >= 200 && summaryText.length <= 600,
      hint: "A concise summary of 2–4 sentences performs best.",
    },
    {
      id: "experience",
      label: "At least one work experience",
      passed: expItems.length > 0,
      hint: "Add your most relevant roles.",
    },
    {
      id: "bullets",
      label: "Experience has 3+ bullet points",
      passed: allHighlights.length >= 3,
      hint: "Describe impact with a few strong bullets per role.",
    },
    {
      id: "quantified",
      label: "Bullets include measurable results",
      passed: quantified >= 2,
      hint: "Add numbers (%, $, counts) to at least two bullets.",
    },
    {
      id: "weak",
      label: "No weak/passive phrasing",
      passed: !hasWeak && allHighlights.length > 0,
      hint: 'Replace phrases like "responsible for" with action verbs.',
    },
    {
      id: "education",
      label: "Education added",
      passed: eduItems.length > 0,
      hint: "Include your degree or relevant training.",
    },
    {
      id: "skills",
      label: "At least 6 skills listed",
      passed: skillCount >= 6,
      hint: "List the keywords ATS systems scan for.",
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return { score, checks, passedCount };
}
