"use client";

import CurrencyComboBox from "@/components/CurrencyComboBox";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { PlusSquare, TrashIcon, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import CreateCategoryDialog from "../_components/CreateCategoryDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import DeleteCategoryDialog from "../_components/DeleteCategoryDialog";

export default function ManagePage() {
  return (
    <>
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <h1 className="text-3xl font-bold">Manage</h1>
            <p className="text-muted-foreground">
              Manage your account settings and categories
            </p>
          </div>
        </div>
      </div>
      <div className="container flex flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Set your default currency for transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencyComboBox />
          </CardContent>
        </Card>
        <CategoryList type="income" />
        <CategoryList type="expense" />
      </div>
    </>
  );
}

function CategoryList({ type }: { type: TransactionType }) {
  const categoriesQuery = useQuery({
    queryKey: ["categories", type],
    queryFn: async () => {
      const res = await fetch(`/api/categories?type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    retry: 1,
  });

  const dataAvailable = categoriesQuery.data?.length > 0;

  return (
    <SkeletonWrapper isLoading={categoriesQuery.isLoading}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {type === "expense" ? (
                <TrendingDown
                  className="h-12 w-12 rounded-lg bg-rose-400/10 p-2 text-rose-500"
                  aria-hidden="true"
                />
              ) : (
                <TrendingUp
                  className="h-12 w-12 rounded-lg bg-emerald-400/10 p-2 text-emerald-500"
                  aria-hidden="true"
                />
              )}
              <div>
                {type === "expense" ? "Expense" : "Income"} Categories
                <div className="text-sm text-muted-foreground">
                  Sorted by name
                </div>
              </div>
            </div>

            <CreateCategoryDialog
              type={type}
              successCallback={() => categoriesQuery.refetch()}
              trigger={
                <Button className="gap-2 text-sm">
                  <PlusSquare className="h-4 w-4" />
                  Create category
                </Button>
              }
            />
          </CardTitle>
        </CardHeader>
        <Separator />
        {!dataAvailable && renderEmptyState(type)}
        {dataAvailable && (
          <div className="grid grid-flow-row gap-2 p-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categoriesQuery.data.map((category: Category) => (
              <CategoryCard category={category} key={category.name} />
            ))}
          </div>
        )}
      </Card>
    </SkeletonWrapper>
  );
}

function renderEmptyState(type: TransactionType) {
  return (
    <div className="flex h-40 w-full flex-col items-center justify-center">
      <p>
        No{" "}
        <span
          className={cn(
            "m-1",
            type === "income" ? "text-emerald-500" : "text-rose-500"
          )}
        >
          {type}
        </span>{" "}
        categories yet
      </p>
      <p className="text-sm text-muted-foreground">
        Create a new category to get started
      </p>
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div
      className="flex flex-col justify-between rounded-md shadow-md shadow-black/[0.1] dark:shadow-white/[0.1]"
      aria-label={`Category card for ${category.name}`}
    >
      <div className="flex flex-col items-center gap-2 p-4">
        <span
          className="text-3xl"
          role="img"
          aria-label={`${category.name} icon`}
        >
          {category.icon}
        </span>
        <span>{category.name}</span>
      </div>
      <DeleteCategoryDialog
        category={category}
        trigger={
          <Button
            className="flex w-full items-center gap-2 rounded-t-none text-muted-foreground hover:bg-rose-500/20"
            variant="secondary"
            aria-label={`Delete ${category.name} category`}
          >
            <TrashIcon className="h-4 w-4" />
            Remove
          </Button>
        }
      />
    </div>
  );
}
