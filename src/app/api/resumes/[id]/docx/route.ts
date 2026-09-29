import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildDocx } from "@/lib/resume/docx";
import { resumeDataSchema, themeSchema } from "@/lib/resume/schema";
import { slugify } from "@/lib/utils";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  const data = resumeDataSchema.parse(resume.data);
  const theme = themeSchema.parse(resume.theme);
  const buffer = await buildDocx(data, theme);

  const filename = `${slugify(resume.title) || "resume"}.docx`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
