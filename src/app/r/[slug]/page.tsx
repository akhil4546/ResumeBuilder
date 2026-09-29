import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { resumeDataSchema, themeSchema, PAGE_SIZES } from "@/lib/resume/schema";
import { PaginatedDocument } from "@/components/templates/paginated-document";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resume = await prisma.resume.findUnique({
    where: { slug },
    select: { isPublic: true, data: true, title: true },
  });
  if (!resume || !resume.isPublic) return { title: "Resume not found" };
  const data = resumeDataSchema.parse(resume.data);
  const name = data.basics.fullName || resume.title;
  return {
    title: `${name} — Resume`,
    description: data.basics.headline || data.basics.summary || undefined,
  };
}

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resume = await prisma.resume.findUnique({ where: { slug } });
  if (!resume || !resume.isPublic) notFound();

  // Best-effort view increment (don't block rendering on it).
  prisma.resume
    .update({ where: { id: resume.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const data = resumeDataSchema.parse(resume.data);
  const theme = themeSchema.parse(resume.theme);
  const size = PAGE_SIZES[theme.pageSize] ?? PAGE_SIZES.letter;

  return (
    <div className="min-h-screen bg-slate-200 py-8">
      <div className="mx-auto px-4" style={{ maxWidth: size.width }}>
        <PaginatedDocument
          template={resume.template}
          data={data}
          theme={theme}
          className="rounded-lg shadow-xl ring-1 ring-black/5"
          showBadges={false}
        />
        <p className="mt-4 text-center text-xs text-slate-500">
          Made with Resumé
        </p>
      </div>
    </div>
  );
}
