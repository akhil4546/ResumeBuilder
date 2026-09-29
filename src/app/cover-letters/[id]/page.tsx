import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { coverLetterDataSchema } from "@/lib/coverletter/schema";
import { CoverLetterEditor } from "@/components/coverletter/cover-letter-editor";

export default async function CoverLetterEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const letter = await prisma.coverLetter.findUnique({ where: { id } });
  if (!letter || letter.userId !== userId) notFound();

  const data = coverLetterDataSchema.parse(letter.data);

  return (
    <CoverLetterEditor id={letter.id} initialTitle={letter.title} initialData={data} />
  );
}
