"use server";

import { redirect } from "next/navigation";
import { UpdateUserCurrencySchema } from "../../../schema/userSettings";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { validateForm } from "@/lib/utils";

export default async function UpdateUserCurrency(currency: string) {
  try {
    const validatedData = validateForm(UpdateUserCurrencySchema, { currency });

    const user = await currentUser();
    if (!user) {
      redirect("/sign-in");
    }

    const userSettings = await prisma.userSettings.update({
      where: {
        userId: user.id,
      },
      data: {
        currency: validatedData.currency,
      },
    });

    return userSettings;
  } catch (error) {
    console.error("Error updating user currency:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update user currency";
    throw new Error(message);
  }
}
