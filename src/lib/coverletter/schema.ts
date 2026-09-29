import { z } from "zod";
import { FONT_FAMILIES } from "@/lib/resume/schema";

export const coverLetterDataSchema = z.object({
  senderName: z.string().default(""),
  senderEmail: z.string().default(""),
  senderPhone: z.string().default(""),
  senderLocation: z.string().default(""),
  date: z.string().default(""), // free text, e.g. "July 1, 2026"
  recipientName: z.string().default(""),
  recipientTitle: z.string().default(""),
  company: z.string().default(""),
  companyAddress: z.string().default(""),
  greeting: z.string().default("Dear Hiring Manager,"),
  body: z.string().default(""),
  closing: z.string().default("Sincerely,"),
  signature: z.string().default(""),
  // styling
  accent: z.string().default("#2563eb"),
  fontFamily: z.string().default("Inter"),
  fontSize: z.number().min(9).max(14).default(11),
});

export type CoverLetterData = z.infer<typeof coverLetterDataSchema>;

export const COVER_FONTS = FONT_FAMILIES;

export function blankCoverLetter(): CoverLetterData {
  return coverLetterDataSchema.parse({});
}

export function sampleCoverLetter(): CoverLetterData {
  return coverLetterDataSchema.parse({
    senderName: "Alex Morgan",
    senderEmail: "alex.morgan@example.com",
    senderPhone: "+1 (555) 123-4567",
    senderLocation: "San Francisco, CA",
    date: "July 1, 2026",
    recipientName: "Hiring Team",
    recipientTitle: "",
    company: "Vercel",
    companyAddress: "",
    greeting: "Dear Hiring Team,",
    body: `I'm excited to apply for the Senior Software Engineer role. Over the past eight years I've built and scaled web platforms used by millions, and I'm drawn to your team's focus on developer experience.

In my current role I led a build-pipeline rewrite that cut deploy times by 43% and shipped an edge product from prototype to general availability. I pair strong fundamentals with a bias for shipping, and I enjoy mentoring others toward a high bar.

I'd welcome the chance to discuss how I can contribute. Thank you for your consideration.`,
    closing: "Sincerely,",
    signature: "Alex Morgan",
  });
}
