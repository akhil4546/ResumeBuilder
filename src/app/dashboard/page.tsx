import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { NewResumeButton } from "@/components/dashboard/new-resume-button";
import { ResumeCard } from "@/components/dashboard/resume-card";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      template: true,
      isPublic: true,
      updatedAt: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your resumes</h1>
          <p className="mt-1 text-sm text-slate-600">
            {resumes.length === 0
              ? "Create your first resume to get started."
              : `${resumes.length} resume${resumes.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <NewResumeButton />
      </div>

      {resumes.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-primary">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No resumes yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-slate-600">
            Start from a blank canvas or use an example to see how everything fits
            together.
          </p>
          <div className="mt-5">
            <NewResumeButton />
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <ResumeCard
              key={r.id}
              resume={{
                id: r.id,
                title: r.title,
                template: r.template,
                isPublic: r.isPublic,
                updatedAt: r.updatedAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
