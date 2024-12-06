import prisma from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { z } from "zod";
import { validateForm } from "@/lib/utils";

const getHistoryDataSchema = z.object({
  timeframe: z.enum(["year", "month"]),
  month: z.coerce.number().min(0).max(11).optional(),
  year: z.coerce.number().min(2000).max(3000),
});

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);

  const queryParams = {
    timeframe: searchParams.get("timeframe"),
    year: searchParams.get("year"),
    month: searchParams.get("month"),
  };

  let validatedParams;
  try {
    validatedParams = validateForm(getHistoryDataSchema, queryParams);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }

  const data = await getHistoryData(user.id, validatedParams.timeframe, {
    year: validatedParams.year,
    month: validatedParams.month ?? 0,
  });

  return Response.json(data);
}

export type GetHistoryPeriodsResponseType = Awaited<
  ReturnType<typeof getHistoryData>
>;

type HistoryData = {
  expense: number;
  income: number;
  month: number;
  year: number;
  day?: number;
};

async function getHistoryData(
  userId: string,
  timeframe: Timeframe,
  period: Period
) {
  switch (timeframe) {
    case "year":
      return await getYearHistoryData(userId, period.year);
    case "month":
      return await getMonthHistoryData(userId, period.year, period.month);
  }
}

async function getYearHistoryData(userId: string, year: number) {
  const result = await prisma.yearHistory.groupBy({
    by: ["month"],
    where: {
      userId,
      year,
    },
    _sum: { expense: true, income: true },
    orderBy: [{ month: "asc" }],
  });

  const history: HistoryData[] = [];
  for (let i = 0; i < 12; i++) {
    const month = result.find((row) => row.month === i);
    history.push({
      year,
      month: i,
      expense: month?._sum.expense || 0,
      income: month?._sum.income || 0,
    });
  }

  return history;
}

async function getMonthHistoryData(
  userId: string,
  year: number,
  month: number
) {
  const result = await prisma.monthHistory.groupBy({
    by: ["day"],
    where: {
      userId,
      year,
      month,
    },
    _sum: { expense: true, income: true },
    orderBy: [{ day: "asc" }],
  });

  const history: HistoryData[] = [];
  const daysInMonth = getDaysInMonth(new Date(year, month));

  for (let i = 1; i <= daysInMonth; i++) {
    const day = result.find((row) => row.day === i);
    history.push({
      year,
      month,
      day: i,
      expense: day?._sum.expense || 0,
      income: day?._sum.income || 0,
    });
  }

  return history;
}
