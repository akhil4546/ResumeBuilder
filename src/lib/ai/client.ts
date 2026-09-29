import Anthropic from "@anthropic-ai/sdk";

/** Thrown when no ANTHROPIC_API_KEY is configured, so the UI can degrade gracefully. */
export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI is not configured");
    this.name = "AiNotConfiguredError";
  }
}

// Resume text is short; Opus 4.8 gives the best quality. Callers set effort per task.
export const AI_MODEL = "claude-opus-4-8";

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new AiNotConfiguredError();
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/** Pull the concatenated text out of a Messages API response. */
export function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
