import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, oauthProviders } from "@/auth";
import { AuthForm } from "@/components/auth/auth-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-bold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white">R</span>
          Resumé
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
          <p className="mb-5 mt-1 text-sm text-slate-600">
            Log in to continue building your resume.
          </p>
          <Suspense>
            <AuthForm mode="login" oauth={oauthProviders} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
