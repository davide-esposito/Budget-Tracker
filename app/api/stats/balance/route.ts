import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OverviewQuerySchema } from "../../../../schema/overview";
import prisma from "@/lib/prisma";
import { validateForm } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const validatedParams = validateForm(OverviewQuerySchema, { from, to });

    const stats = await getBalanceStats(
      user.id,
      validatedParams.from,
      validatedParams.to
    );

    return Response.json(stats);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}

export type GetBalanceStatsResponseType = Awaited<
  ReturnType<typeof getBalanceStats>
>;

async function getBalanceStats(userId: string, from: Date, to: Date) {
  try {
    const totals = await prisma.transaction.groupBy({
      by: ["type"],
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
    });

    return {
      expense: totals.find((t) => t.type === "expense")?._sum.amount || 0,
      income: totals.find((t) => t.type === "income")?._sum.amount || 0,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch balance stats";
    throw new Error(message);
  }
}
