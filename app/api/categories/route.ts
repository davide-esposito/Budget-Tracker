import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { validateForm } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const paramType = searchParams.get("type");

  const TypeSchema = z.enum(["income", "expense"]).nullable();

  let type: "income" | "expense" | null = null;
  try {
    type = validateForm(TypeSchema, paramType);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 400 });
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: user.id,
      ...(type && { type }),
    },
    orderBy: {
      name: "asc",
    },
  });

  return Response.json(categories);
}
