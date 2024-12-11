import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OverviewQuerySchema } from "../../../schema/overview";
import prisma from "@/lib/prisma";
import { getFormatterForCurrency } from "@/lib/helpers";
import { validateForm } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const validatedParams = validateForm(OverviewQuerySchema, { from, to });

    const transactions = await getTransactionsHistory(
      user.id,
      new Date(validatedParams.from),
      new Date(validatedParams.to)
    );

    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error fetching transactions history:", error);

    let message = "Unexpected error occurred";
    let status = 500;

    if (error instanceof Error) {
      message = error.message;
      status = error.message.includes("validation") ? 400 : 500;
    }

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
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

    const formatter = getFormatterForCurrency(userSettings.currency);

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
