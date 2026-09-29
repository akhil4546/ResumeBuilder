"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import {
  blankCoverLetter,
  sampleCoverLetter,
  coverLetterDataSchema,
  type CoverLetterData,
} from "@/lib/coverletter/schema";

async function assertOwner(id: string, userId: string) {
  const cl = await prisma.coverLetter.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!cl || cl.userId !== userId) throw new Error("Not found");
}

export async function createCoverLetter(options?: { sample?: boolean }) {
  const userId = await requireUserId();
  const data = options?.sample ? sampleCoverLetter() : blankCoverLetter();
  const cl = await prisma.coverLetter.create({
    data: {
      userId,
      title: options?.sample ? "Example Cover Letter" : "Untitled Cover Letter",
      data: data as object,
    },
    select: { id: true },
  });
  revalidatePath("/cover-letters");
  return cl.id;
}

export async function deleteCoverLetter(id: string) {
  const userId = await requireUserId();
  await assertOwner(id, userId);
  await prisma.coverLetter.delete({ where: { id } });
  revalidatePath("/cover-letters");
}

export async function renameCoverLetter(id: string, title: string) {
  const userId = await requireUserId();
  await assertOwner(id, userId);
  await prisma.coverLetter.update({
    where: { id },
    data: { title: title.slice(0, 200) || "Untitled Cover Letter" },
  });
  revalidatePath("/cover-letters");
}

export async function saveCoverLetter(input: {
  id: string;
  title?: string;
  data: CoverLetterData;
}) {
  const userId = await requireUserId();
  await assertOwner(input.id, userId);
  const data = coverLetterDataSchema.parse(input.data);
  await prisma.coverLetter.update({
    where: { id: input.id },
    data: {
      ...(input.title !== undefined ? { title: input.title.slice(0, 200) } : {}),
      data: data as object,
    },
  });
  return { ok: true, savedAt: new Date().toISOString() };
}
