"use server";

import { requireUserId } from "@/lib/session";
import { getAnthropic, AI_MODEL, textOf, AiNotConfiguredError } from "@/lib/ai/client";

export type AiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: "not_configured" | "error"; message?: string };

async function run<T>(fn: () => Promise<T>): Promise<AiResult<T>> {
  try {
    await requireUserId();
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return { ok: false, code: "not_configured" };
    }
    return {
      ok: false,
      code: "error",
      message: err instanceof Error ? err.message : "Something went wrong",
    };
  }
}

const SYSTEM =
  "You are an expert resume writer. You write concise, high-impact resume content in a confident, professional voice. " +
  "You use strong action verbs, quantify impact when the input supports it, and never invent specific facts, numbers, employers, or dates that were not provided. " +
  "You never use first-person pronouns and you avoid clichés and filler.";

/** Rewrite a single bullet point to be stronger. Returns the improved line. */
export async function improveBullet(text: string): Promise<AiResult<string>> {
  return run(async () => {
    const client = getAnthropic();
    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 400,
      output_config: { effort: "low" },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content:
            "Rewrite this resume bullet point to be stronger and more concise. " +
            "Start with a strong action verb, keep it to one line, and preserve the original meaning. " +
            "Do not invent numbers or facts that aren't present. Return ONLY the rewritten bullet, with no quotes or preamble.\n\n" +
            text,
        },
      ],
    });
    return textOf(msg).replace(/^["'•\-\s]+/, "");
  });
}

/** Generate several bullet suggestions for a role. Returns 3–4 lines. */
export async function generateBullets(context: string): Promise<AiResult<string[]>> {
  return run(async () => {
    const client = getAnthropic();
    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 700,
      output_config: {
        effort: "medium",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              bullets: { type: "array", items: { type: "string" } },
            },
            required: ["bullets"],
            additionalProperties: false,
          },
        },
      },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content:
            "Suggest 4 strong, generic resume bullet points for the following role. " +
            "Each should start with an action verb and use {placeholders} in curly braces where the candidate should insert their own specifics (numbers, tools, outcomes). " +
            "Do not invent concrete numbers.\n\nRole/context: " +
            context,
        },
      ],
    });
    const parsed = JSON.parse(textOf(msg)) as { bullets?: string[] };
    return (parsed.bullets ?? []).filter((b) => b && b.trim()).slice(0, 4);
  });
}

/** Write a professional summary from structured context. */
export async function writeSummary(input: {
  headline: string;
  skills: string[];
  experience: { position: string; company: string; highlights: string[] }[];
}): Promise<AiResult<string>> {
  return run(async () => {
    const client = getAnthropic();
    const context = [
      input.headline ? `Target role / headline: ${input.headline}` : "",
      input.skills.length ? `Key skills: ${input.skills.join(", ")}` : "",
      input.experience.length
        ? "Experience:\n" +
          input.experience
            .map(
              (e) =>
                `- ${e.position} at ${e.company}` +
                (e.highlights.length ? `: ${e.highlights.join("; ")}` : "")
            )
            .join("\n")
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 400,
      output_config: { effort: "medium" },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content:
            "Write a professional resume summary of 2–3 sentences based on the details below. " +
            "Lead with seniority and specialty, highlight strengths, and keep it tight. " +
            "Do not invent specific numbers, employers, or years of experience that aren't provided. Return ONLY the summary text.\n\n" +
            (context || "A capable professional. Write a strong, general-purpose summary."),
        },
      ],
    });
    return textOf(msg);
  });
}

/** Suggest concrete edits to better match a job description. Returns short tips. */
export async function tailorToJob(input: {
  jd: string;
  resumeText: string;
}): Promise<AiResult<string[]>> {
  return run(async () => {
    const client = getAnthropic();
    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 900,
      output_config: {
        effort: "medium",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              suggestions: { type: "array", items: { type: "string" } },
            },
            required: ["suggestions"],
            additionalProperties: false,
          },
        },
      },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content:
            "Compare this resume to the job description and give 4–6 specific, actionable suggestions to tailor the resume for this role " +
            "(e.g. skills to surface, phrasing to align with the JD's language, gaps to address honestly). " +
            "Be concrete and concise. Do not suggest fabricating experience.\n\n" +
            "=== JOB DESCRIPTION ===\n" +
            input.jd.slice(0, 6000) +
            "\n\n=== RESUME ===\n" +
            input.resumeText.slice(0, 6000),
        },
      ],
    });
    const parsed = JSON.parse(textOf(msg)) as { suggestions?: string[] };
    return (parsed.suggestions ?? []).filter((s) => s && s.trim());
  });
}
