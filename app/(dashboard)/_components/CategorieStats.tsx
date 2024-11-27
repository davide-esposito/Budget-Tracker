"use client";

import SkeletonWrapper from "@/components/SkeletonWrapper";
import { DatetoUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { GetCategorieStatsResponseType } from "../../api/stats/categories/route";
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
        `/api/stats/categories?from=${DatetoUTCDate(from)}&to=${DatetoUTCDate(
          to
        )}`
      ).then((res) => res.json()),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  function renderCategoriesCard(type: TransactionType) {
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
            <div className="flex h-60 w-full flex-col items-center justify-center">
              No data for the selected period
              <p className="text-sm text-muted-foreground">
                Try selecting a different period or try adding new{" "}
                {type === "income" ? "incomes" : "expenses"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-60 w-full px-4">
              <div className="flex w-full flex-col gap-4 p-4">
                {filteredData.map((item) => (
                  <div key={item.category} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-400">
                        {item.categoryIcon} {item.category}
                        <span className="ml-2 text-xs text-muted-foreground">
                          (
                          {(((item._sum.amount || 0) * 100) / total).toFixed(0)}
                          %)
                        </span>
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatter.format(item._sum.amount || 0)}
                      </span>
                    </div>
                    <Progress
                      value={((item._sum.amount || 0) * 100) / total}
                      indicator={
                        type === "income" ? "bg-emerald-500" : "bg-rose-500"
                      }
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        {renderCategoriesCard("income")}
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        {renderCategoriesCard("expense")}
      </SkeletonWrapper>
    </div>
  );
}
