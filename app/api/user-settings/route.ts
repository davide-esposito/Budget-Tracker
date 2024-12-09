import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  try {
    let userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          currency: "USD",
        },
      });
    }

    revalidatePath("/");

    return new Response(JSON.stringify(userSettings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching or creating user settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch or create user settings" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
