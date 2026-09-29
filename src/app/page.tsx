import Link from "next/link";
import {
  FileText,
  Layout,
  Palette,
  Download,
  Share2,
  ShieldCheck,
  Sparkles,
  MoveVertical,
} from "lucide-react";
import { auth } from "@/auth";

const features = [
  {
    icon: Layout,
    title: "Section-based editor",
    body: "Experience, education, skills, projects, certifications, custom sections — add what you need.",
  },
  {
    icon: MoveVertical,
    title: "Drag-and-drop",
    body: "Reorder sections and bullet points instantly. Hide anything you don't want to show.",
  },
  {
    icon: Sparkles,
    title: "Live preview",
    body: "See a pixel-accurate page update as you type. No guessing how it prints.",
  },
  {
    icon: Palette,
    title: "Templates & themes",
    body: "Switch templates, fonts, colors, spacing and layout without losing your content.",
  },
  {
    icon: Download,
    title: "Export to PDF & DOCX",
    body: "Download a crisp, selectable-text PDF or an editable Word document in one click.",
  },
  {
    icon: Share2,
    title: "Shareable links",
    body: "Publish a public link to your resume with view tracking, or keep it private.",
  },
  {
    icon: ShieldCheck,
    title: "ATS-friendly",
    body: "Clean, parseable templates and a completeness score to help you pass the bots.",
  },
  {
    icon: FileText,
    title: "Import / Export JSON",
    body: "Bring data in from the JSON Resume standard, or take your data with you anytime.",
  },
];

export default async function Home() {
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
              R
            </span>
            Resumé
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 font-medium text-slate-700 hover:text-slate-900">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Free, fast, and yours to export
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Build a resume that gets you{" "}
            <span className="text-primary">interviews</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
            A modern resume builder with a live preview, beautiful ATS-friendly
            templates, and one-click PDF export. No sign-up walls, no watermarks.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href={signedIn ? "/dashboard" : "/register"}
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {signedIn ? "Open your dashboard" : "Start building — it's free"}
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-slate-500">
          Built with Next.js, Prisma &amp; PostgreSQL.
        </div>
      </footer>
    </div>
  );
}
