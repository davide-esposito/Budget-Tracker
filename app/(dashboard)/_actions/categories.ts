"use server";

import { currentUser } from "@clerk/nextjs/server";
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
  DeleteCategorySchema,
  DeleteCategorySchemaType,
} from "../../../schema/categories";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { validateForm } from "@/lib/utils";

async function requireUser() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

export async function CreateCategory(form: CreateCategorySchemaType) {
  const { name, icon, type } = validateForm(CreateCategorySchema, form);

  const user = await requireUser();

  return await prisma.category.create({
    data: {
      userId: user.id,
      name,
      icon,
      type,
    },
  });
}

export async function DeleteCategory(form: DeleteCategorySchemaType) {
  const { name, type } = validateForm(DeleteCategorySchema, form);

  const user = await requireUser();

  return await prisma.category.delete({
    where: {
      name_userId_type: {
        userId: user.id,
        name,
        type,
      },
    },
  });
}
