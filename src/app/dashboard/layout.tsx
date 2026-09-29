import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/app-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={{ name: session.user.name, email: session.user.email }} />
      {children}
    </div>
  );
}
