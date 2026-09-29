import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { resumeDataSchema, themeSchema } from "@/lib/resume/schema";
import { aiEnabled } from "@/lib/ai/client";
import { EditorClient } from "@/components/editor/editor-client";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== userId) notFound();

  // Parse + normalize stored JSON so older resumes always satisfy the schema.
  const data = resumeDataSchema.parse(resume.data);
  const theme = themeSchema.parse(resume.theme);

  return (
    <EditorClient
      key={resume.id}
      aiEnabled={aiEnabled()}
      resume={{
        id: resume.id,
        title: resume.title,
        template: resume.template,
        data,
        theme,
        isPublic: resume.isPublic,
        slug: resume.slug,
      }}
    />
  );
}
