import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { validateForm } from "@/lib/utils";
import { z } from "zod";

const OverviewQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let validatedParams;
  try {
    validatedParams = validateForm(OverviewQuerySchema, { from, to });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid query parameters";
    return Response.json({ error: message }, { status: 400 });
  }

  const stats = await getCategorieStats(
    user.id,
    validatedParams.from,
    validatedParams.to
  );

  return Response.json(stats);
}

export type GetCategorieStatsResponseType = Awaited<
  ReturnType<typeof getCategorieStats>
>;

async function getCategorieStats(userId: string, from: Date, to: Date) {
  const stats = await prisma.transaction.groupBy({
    by: ["type", "category", "categoryIcon"],
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });
  return stats;
}
