"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { blankResumeData, sampleResumeData, defaultTheme } from "@/lib/resume/defaults";
import { resumeDataSchema, themeSchema } from "@/lib/resume/schema";
import type { ResumeData, ResumeTheme } from "@/lib/resume/schema";

async function assertOwner(resumeId: string, userId: string) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: { userId: true },
  });
  if (!resume || resume.userId !== userId) {
    throw new Error("Not found");
  }
}

export async function createResume(options?: { sample?: boolean; title?: string }) {
  const userId = await requireUserId();
  const data = options?.sample ? sampleResumeData() : blankResumeData();
  const resume = await prisma.resume.create({
    data: {
      userId,
      title: options?.title ?? (options?.sample ? "Example Resume" : "Untitled Resume"),
      data: data as object,
      theme: defaultTheme() as object,
      template: "modern",
    },
    select: { id: true },
  });
  revalidatePath("/dashboard");
  return resume.id;
}

export async function duplicateResume(resumeId: string) {
  const userId = await requireUserId();
  const original = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!original || original.userId !== userId) throw new Error("Not found");
  const copy = await prisma.resume.create({
    data: {
      userId,
      title: `${original.title} (copy)`,
      data: original.data as object,
      theme: original.theme as object,
      template: original.template,
    },
    select: { id: true },
  });
  revalidatePath("/dashboard");
  return copy.id;
}

export async function deleteResume(resumeId: string) {
  const userId = await requireUserId();
  await assertOwner(resumeId, userId);
  await prisma.resume.delete({ where: { id: resumeId } });
  revalidatePath("/dashboard");
}

export async function renameResume(resumeId: string, title: string) {
  const userId = await requireUserId();
  await assertOwner(resumeId, userId);
  await prisma.resume.update({
    where: { id: resumeId },
    data: { title: title.slice(0, 200) || "Untitled Resume" },
  });
  revalidatePath("/dashboard");
}

export async function saveResume(input: {
  id: string;
  title?: string;
  template?: string;
  data: ResumeData;
  theme: ResumeTheme;
}) {
  const userId = await requireUserId();
  await assertOwner(input.id, userId);

  // Validate/normalize before persisting.
  const data = resumeDataSchema.parse(input.data);
  const theme = themeSchema.parse(input.theme);

  await prisma.resume.update({
    where: { id: input.id },
    data: {
      ...(input.title !== undefined ? { title: input.title.slice(0, 200) } : {}),
      ...(input.template !== undefined ? { template: input.template } : {}),
      data: data as object,
      theme: theme as object,
    },
  });
  return { ok: true, savedAt: new Date().toISOString() };
}

export async function setPublic(resumeId: string, isPublic: boolean) {
  const userId = await requireUserId();
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) throw new Error("Not found");

  let slug = resume.slug;
  if (isPublic && !slug) {
    const base = slugify(resume.title) || "resume";
    slug = `${base}-${nanoid(6)}`;
  }

  await prisma.resume.update({
    where: { id: resumeId },
    data: { isPublic, slug },
  });
  revalidatePath("/dashboard");
  return { slug };
}

export async function saveVersion(resumeId: string, label?: string) {
  const userId = await requireUserId();
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) throw new Error("Not found");
  await prisma.resumeVersion.create({
    data: {
      resumeId,
      label: label ?? `Snapshot ${new Date().toLocaleString()}`,
      data: resume.data as object,
      theme: resume.theme as object,
      template: resume.template,
    },
  });
  // Keep only the 30 most recent snapshots per resume.
  const old = await prisma.resumeVersion.findMany({
    where: { resumeId },
    orderBy: { createdAt: "desc" },
    skip: 30,
    select: { id: true },
  });
  if (old.length) {
    await prisma.resumeVersion.deleteMany({
      where: { id: { in: old.map((v) => v.id) } },
    });
  }
  return { ok: true };
}

export async function listVersions(resumeId: string) {
  const userId = await requireUserId();
  await assertOwner(resumeId, userId);
  return prisma.resumeVersion.findMany({
    where: { resumeId },
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, template: true, createdAt: true },
  });
}

export async function restoreVersion(versionId: string) {
  const userId = await requireUserId();
  const version = await prisma.resumeVersion.findUnique({ where: { id: versionId } });
  if (!version) throw new Error("Not found");

  const resume = await prisma.resume.findUnique({ where: { id: version.resumeId } });
  if (!resume || resume.userId !== userId) throw new Error("Not found");

  // Snapshot the current state before overwriting, so a restore is itself undoable.
  await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      label: `Before restore · ${new Date().toLocaleString()}`,
      data: resume.data as object,
      theme: resume.theme as object,
      template: resume.template,
    },
  });

  await prisma.resume.update({
    where: { id: resume.id },
    data: {
      data: version.data as object,
      theme: version.theme as object,
      template: version.template,
    },
  });

  return {
    data: version.data,
    theme: version.theme,
    template: version.template,
  };
}
