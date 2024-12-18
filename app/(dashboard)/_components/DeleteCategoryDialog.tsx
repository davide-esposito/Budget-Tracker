"use client";

import React, { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Category } from "@prisma/client";
import { DeleteCategory } from "../_actions/categories";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TransactionType } from "@/lib/types";

interface Props {
  trigger: ReactNode;
  category: Category;
}

export default function DeleteCategoryDialog({ category, trigger }: Props) {
  const queryClient = useQueryClient();
  const categoryIdentifier = `${category.name}-${category.type}`;

  const deleteMutation = useMutation({
    mutationFn: DeleteCategory,
    onSuccess: async () => {
      toast.success(`Category deleted successfully 🎉`, {
        id: categoryIdentifier,
      });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => {
      toast.error("An error occurred while deleting the category", {
        id: categoryIdentifier,
      });
    },
  });

  const handleDelete = () => {
    toast.loading(`Deleting category ${category.name}...`, {
      id: categoryIdentifier,
    });

    deleteMutation.mutate({
      name: category.name,
      type: category.type as TransactionType,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete the category, {category.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Deleting this category will
            permanently remove it from your records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel aria-label="Cancel deletion">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            aria-label={`Delete category ${category.name}`}
            onClick={handleDelete}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
