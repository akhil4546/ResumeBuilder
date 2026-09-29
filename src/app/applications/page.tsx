import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/app/app-header";
import { ApplicationBoard } from "@/components/applications/board";
import { isStatus, type ApplicationDTO } from "@/lib/applications";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [apps, resumes, letters] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { order: "asc" }],
    }),
    prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
    prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  const dtos: ApplicationDTO[] = apps.map((a) => ({
    id: a.id,
    company: a.company,
    role: a.role,
    location: a.location,
    salary: a.salary,
    jobUrl: a.jobUrl,
    jobDescription: a.jobDescription,
    notes: a.notes,
    status: isStatus(a.status) ? a.status : "SAVED",
    order: a.order,
    appliedAt: a.appliedAt ? a.appliedAt.toISOString() : null,
    resumeId: a.resumeId,
    coverLetterId: a.coverLetterId,
  }));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={{ name: session.user.name, email: session.user.email }} />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <ApplicationBoard
          initialApps={dtos}
          resumeOptions={resumes}
          coverLetterOptions={letters}
        />
      </main>
    </div>
  );
}
