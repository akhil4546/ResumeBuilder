import { Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/app-header";
import {
  NewCoverLetterButton,
  CoverLetterCard,
} from "@/components/coverletter/cover-letter-list";

export default async function CoverLettersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  const letters = await prisma.coverLetter.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={{ name: session.user.name, email: session.user.email }} />
      <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cover letters</h1>
          <p className="mt-1 text-sm text-slate-600">
            {letters.length === 0
              ? "Write a tailored cover letter to pair with your resume."
              : `${letters.length} cover letter${letters.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <NewCoverLetterButton />
      </div>

      {letters.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-primary">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No cover letters yet</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-600">
            Start from scratch or use an example to see the structure.
          </p>
          <div className="mt-5">
            <NewCoverLetterButton />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {letters.map((l) => (
            <CoverLetterCard
              key={l.id}
              item={{ id: l.id, title: l.title, updatedAt: l.updatedAt.toISOString() }}
            />
          ))}
        </div>
      )}
      </main>
    </div>
  );
}
