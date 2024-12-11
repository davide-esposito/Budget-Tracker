"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserSettings } from "@prisma/client";
import { dateToUTCDate, getFormatterForCurrency } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import { GetCategorieStatsResponseType } from "../../api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface Props {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}

export default function CategorieStats({ userSettings, from, to }: Props) {
  const statsQuery = useQuery<GetCategorieStatsResponseType>({
    queryKey: ["overview", "stats", "categories", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/categories?from=${dateToUTCDate(from)}&to=${dateToUTCDate(
          to
        )}`
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch category stats");
        return res.json();
      }),
    retry: 1,
  });

  const formatter = useMemo(
    () => getFormatterForCurrency(userSettings.currency),
    [userSettings.currency]
  );

  function renderCategoryCard(type: TransactionType) {
    const filteredData =
      statsQuery.data?.filter((el) => el.type === type) || [];
    const total = filteredData.reduce(
      (acc, curr) => acc + (curr._sum.amount || 0),
      0
    );

    return (
      <Card className="h-80 w-full col-span-6">
        <CardHeader>
          <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
            {type === "income" ? "Income" : "Expense"} by category
          </CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between gap-2">
          {filteredData.length === 0 ? (
            renderEmptyState(type)
          ) : (
            <ScrollArea className="h-60 w-full px-4">
              <div className="flex w-full flex-col gap-4 p-4">
                {filteredData.map((item) =>
                  renderCategoryRow(item, type, total)
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    );
  }

  function renderEmptyState(type: TransactionType) {
    return (
      <div className="flex h-60 w-full flex-col items-center justify-center">
        No data for the selected period
        <p className="text-sm text-muted-foreground">
          Try selecting a different period or try adding new{" "}
          {type === "income" ? "incomes" : "expenses"}.
        </p>
      </div>
    );
  }

  function renderCategoryRow(
    item: GetCategorieStatsResponseType[number],
    type: TransactionType,
    total: number
  ) {
    const percentage = ((item._sum.amount || 0) * 100) / total;
    return (
      <div key={item.category} className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-400">
            {item.categoryIcon} {item.category}
            <span className="ml-2 text-xs text-muted-foreground">
              ({percentage.toFixed(0)}%)
            </span>
          </span>
          <span className="text-sm text-gray-400">
            {formatter.format(item._sum.amount || 0)}
          </span>
        </div>
        <Progress
          value={percentage}
          indicator={type === "income" ? "bg-emerald-500" : "bg-rose-500"}
        />
      </div>
    );
  }

  function renderErrorState() {
    return (
      <div className="flex h-80 w-full items-center justify-center">
        <p className="text-sm text-red-500">Failed to load category stats.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      {statsQuery.isError
        ? renderErrorState()
        : ["income", "expense"].map((type) => (
            <SkeletonWrapper key={type} isLoading={statsQuery.isFetching}>
              {renderCategoryCard(type as TransactionType)}
            </SkeletonWrapper>
          ))}
    </div>
  );
}
