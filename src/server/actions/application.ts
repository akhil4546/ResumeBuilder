"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { isStatus, type AppStatus } from "@/lib/applications";

async function assertOwner(id: string, userId: string) {
  const app = await prisma.jobApplication.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!app || app.userId !== userId) throw new Error("Not found");
}

export type ApplicationInput = {
  company: string;
  role: string;
  location?: string;
  salary?: string;
  jobUrl?: string;
  jobDescription?: string;
  notes?: string;
  status?: string;
  appliedAt?: string | null;
  resumeId?: string | null;
  coverLetterId?: string | null;
};

function normalizeStatus(s?: string): AppStatus {
  return s && isStatus(s) ? s : "SAVED";
}

export async function createApplication(input: ApplicationInput) {
  const userId = await requireUserId();
  const status = normalizeStatus(input.status);

  const count = await prisma.jobApplication.count({ where: { userId, status } });

  const app = await prisma.jobApplication.create({
    data: {
      userId,
      company: input.company.slice(0, 200),
      role: input.role.slice(0, 200),
      location: input.location?.slice(0, 200) ?? "",
      salary: input.salary?.slice(0, 100) ?? "",
      jobUrl: input.jobUrl?.slice(0, 1000) ?? "",
      jobDescription: input.jobDescription ?? "",
      notes: input.notes ?? "",
      status,
      order: count,
      appliedAt: input.appliedAt ? new Date(input.appliedAt) : status === "APPLIED" ? new Date() : null,
      resumeId: input.resumeId || null,
      coverLetterId: input.coverLetterId || null,
    },
    select: { id: true },
  });
  revalidatePath("/applications");
  return app.id;
}

export async function updateApplication(id: string, input: ApplicationInput) {
  const userId = await requireUserId();
  await assertOwner(id, userId);
  await prisma.jobApplication.update({
    where: { id },
    data: {
      company: input.company.slice(0, 200),
      role: input.role.slice(0, 200),
      location: input.location?.slice(0, 200) ?? "",
      salary: input.salary?.slice(0, 100) ?? "",
      jobUrl: input.jobUrl?.slice(0, 1000) ?? "",
      jobDescription: input.jobDescription ?? "",
      notes: input.notes ?? "",
      ...(input.status ? { status: normalizeStatus(input.status) } : {}),
      appliedAt:
        input.appliedAt === undefined
          ? undefined
          : input.appliedAt
          ? new Date(input.appliedAt)
          : null,
      resumeId: input.resumeId ?? null,
      coverLetterId: input.coverLetterId ?? null,
    },
  });
  revalidatePath("/applications");
}

export async function deleteApplication(id: string) {
  const userId = await requireUserId();
  await assertOwner(id, userId);
  await prisma.jobApplication.delete({ where: { id } });
  revalidatePath("/applications");
}

/**
 * Move an application to a status column and set the order of that column.
 * `orderedIds` is the full ordered list of ids in the target column (incl. `id`).
 */
export async function moveApplication(
  id: string,
  toStatus: string,
  orderedIds: string[]
) {
  const userId = await requireUserId();
  await assertOwner(id, userId);
  const status = normalizeStatus(toStatus);

  await prisma.$transaction([
    prisma.jobApplication.update({ where: { id }, data: { status } }),
    ...orderedIds.map((cid, index) =>
      prisma.jobApplication.updateMany({
        where: { id: cid, userId },
        data: { order: index },
      })
    ),
  ]);
  revalidatePath("/applications");
}
