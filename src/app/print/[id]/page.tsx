import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resumeDataSchema, themeSchema, PAGE_SIZES } from "@/lib/resume/schema";
import { ResumeDocument } from "@/components/templates";
import { PrintTrigger } from "@/components/editor/print-trigger";

export default async function PrintPage({
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

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== session.user.id) notFound();

  const data = resumeDataSchema.parse(resume.data);
  const theme = themeSchema.parse(resume.theme);
  const size = PAGE_SIZES[theme.pageSize] ?? PAGE_SIZES.letter;

  return (
    <div className="print-root min-h-screen bg-slate-200 py-8">
      <style>{`@page { size: ${theme.pageSize === "a4" ? "A4" : "letter"}; margin: 0; }`}</style>
      <PrintTrigger auto={auto !== "0"} />
      <div className="mx-auto" style={{ width: size.width }}>
        <ResumeDocument template={resume.template} data={data} theme={theme} />
      </div>
    </div>
  );
}
