import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      redirect("/sign-in");
    }

    const periods = await getHistoryPeriods(user.id);

    return Response.json(periods);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}

export type GetHistoryPeriodsResponseType = Awaited<
  ReturnType<typeof getHistoryPeriods>
>;

async function getHistoryPeriods(userId: string) {
  try {
    const result = await prisma.monthHistory.findMany({
      where: {
        userId,
      },
      select: {
        year: true,
      },
      distinct: ["year"],
      orderBy: [{ year: "asc" }],
    });

    const years = result.map((el) => el.year);

    if (years.length === 0) {
      return [new Date().getFullYear()];
    }

    return years;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database query failed";
    throw new Error(`Failed to fetch history periods: ${message}`);
  }
}
