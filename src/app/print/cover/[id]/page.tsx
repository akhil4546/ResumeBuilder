import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { coverLetterDataSchema } from "@/lib/coverletter/schema";
import { CoverLetterDocument } from "@/components/coverletter/cover-letter-document";
import { PrintTrigger } from "@/components/editor/print-trigger";

export default async function CoverLetterPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string }>;
}) {
  const { id } = await params;
  const { auto } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const letter = await prisma.coverLetter.findUnique({ where: { id } });
  if (!letter || letter.userId !== session.user.id) notFound();

  const data = coverLetterDataSchema.parse(letter.data);

  return (
    <div className="print-root min-h-screen bg-slate-200 py-8">
      <PrintTrigger auto={auto !== "0"} />
      <div className="mx-auto" style={{ width: 816 }}>
        <CoverLetterDocument data={data} />
      </div>
    </div>
  );
}
