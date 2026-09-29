import type { ResumeData } from "./schema";
import {
  asExperience,
  asEducation,
  asSkill,
  asProject,
  asCertification,
  asCustom,
} from "@/components/templates/shared";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "you", "our", "are", "will", "have", "this", "that",
  "from", "your", "who", "all", "can", "not", "but", "has", "was", "were", "their",
  "they", "them", "its", "into", "out", "how", "why", "what", "when", "where",
  "about", "across", "within", "using", "used", "use", "able", "also", "such",
  "more", "most", "than", "then", "over", "under", "per", "via", "etc", "including",
  "include", "includes", "well", "years", "year", "experience", "work", "working",
  "team", "teams", "role", "roles", "job", "candidate", "candidates", "ideal",
  "responsibilities", "requirements", "required", "preferred", "plus", "strong",
  "excellent", "good", "great", "ability", "skills", "skill", "knowledge",
  "understanding", "proficiency", "proficient", "familiarity", "familiar", "must",
  "should", "would", "could", "new", "help", "helps", "build", "building", "join",
  "looking", "seeking", "opportunity", "company", "companies", "business", "we're",
  "you'll", "we", "us", "a", "an", "of", "to", "in", "on", "at", "as", "is", "be",
  "or", "by", "it", "if", "up", "do", "so", "one", "may",
]);

// Multi-word skills worth catching as a single phrase.
const KNOWN_PHRASES = [
  "machine learning", "deep learning", "data analysis", "data science",
  "product management", "project management", "program management",
  "customer success", "customer service", "customer experience",
  "user experience", "user research", "user interface", "product design",
  "a/b testing", "unit testing", "test automation", "continuous integration",
  "continuous delivery", "ci/cd", "rest api", "rest apis", "graphql",
  "react native", "node.js", "next.js", "ruby on rails", "spring boot",
  "public speaking", "cross-functional", "go-to-market", "business development",
  "account management", "financial modeling", "supply chain", "quality assurance",
  "agile", "scrum", "kanban", "stakeholder management", "change management",
  "cloud computing", "distributed systems", "microservices", "system design",
  "natural language processing", "computer vision", "time series",
  "search engine optimization", "social media", "content marketing",
  "email marketing", "growth marketing", "demand generation",
];

const TOKEN_RE = /[a-zA-Z][a-zA-Z0-9+#./-]{1,}/g;

function normalize(text: string): string {
  return text.toLowerCase();
}

export type Keyword = { term: string; count: number };

/** Extract the most salient keywords/phrases from a job description. */
export function extractKeywords(jd: string, limit = 28): Keyword[] {
  const lower = normalize(jd);
  const counts = new Map<string, number>();

  // Known multi-word phrases first.
  for (const phrase of KNOWN_PHRASES) {
    const re = new RegExp(`\\b${escapeRe(phrase)}\\b`, "g");
    const n = (lower.match(re) || []).length;
    if (n > 0) counts.set(phrase, (counts.get(phrase) ?? 0) + n * 2); // weight phrases
  }

  // Single tokens.
  const tokens = lower.match(TOKEN_RE) ?? [];
  for (const raw of tokens) {
    const t = raw.replace(/[.]+$/, "");
    if (t.length < 3 || STOPWORDS.has(t) || /^\d+$/.test(t)) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, limit);
}

/** Concatenate all resume text into a single searchable corpus. */
export function resumeCorpus(data: ResumeData): string {
  const { basics, sections } = data;
  const parts: string[] = [basics.headline, basics.summary];
  for (const s of sections) {
    parts.push(s.title, s.text);
    switch (s.type) {
      case "experience":
        for (const it of s.items.map(asExperience))
          parts.push(it.position, it.company, it.summary, ...it.highlights);
        break;
      case "education":
        for (const it of s.items.map(asEducation))
          parts.push(it.institution, it.degree, it.area, ...it.highlights);
        break;
      case "skills":
        for (const it of s.items.map(asSkill)) parts.push(it.name, ...it.keywords);
        break;
      case "projects":
        for (const it of s.items.map(asProject))
          parts.push(it.name, it.description, ...it.highlights, ...it.keywords);
        break;
      case "certifications":
        for (const it of s.items.map(asCertification)) parts.push(it.name, it.issuer);
        break;
      case "custom":
        for (const it of s.items.map(asCustom))
          parts.push(it.title, it.subtitle, it.description, ...it.highlights);
        break;
    }
  }
  return normalize(parts.filter(Boolean).join(" "));
}

export type MatchResult = {
  score: number;
  matched: Keyword[];
  missing: Keyword[];
  total: number;
};

/** Compare a job description against the resume and score keyword coverage. */
export function matchResume(jd: string, data: ResumeData): MatchResult {
  const keywords = extractKeywords(jd);
  const corpus = resumeCorpus(data);
  const matched: Keyword[] = [];
  const missing: Keyword[] = [];

  for (const kw of keywords) {
    const re = new RegExp(`\\b${escapeRe(kw.term)}`, "i");
    if (re.test(corpus)) matched.push(kw);
    else missing.push(kw);
  }

  const total = keywords.length;
  const score = total === 0 ? 0 : Math.round((matched.length / total) * 100);
  return { score, matched, missing, total };
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
