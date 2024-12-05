import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OverviewQuerySchema } from "../../../schema/overview";
import prisma from "@/lib/prisma";
import { GetFormatterForCurrency } from "@/lib/helpers";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({ from, to });
  if (!queryParams.success) {
    return new Response(JSON.stringify({ error: queryParams.error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const transactions = await getTransactionsHistory(
      user.id,
      new Date(queryParams.data.from),
      new Date(queryParams.data.to)
    );

    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching transactions history:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch transaction history" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export type GetTransactionsHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

async function getTransactionsHistory(userId: string, from: Date, to: Date) {
  try {
    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId,
      },
    });

    if (!userSettings) {
      throw new Error("User settings not found");
    }

    const formatter = GetFormatterForCurrency(userSettings.currency);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return transactions.map((transaction) => ({
      ...transaction,
      formattedAmount: formatter.format(transaction.amount),
    }));
  } catch (error) {
    console.error("Error in getTransactionsHistory:", error);
    throw new Error("Failed to fetch transactions from the database");
  }
}
