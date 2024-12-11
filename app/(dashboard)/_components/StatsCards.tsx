"use client";

import { UserSettings } from "@prisma/client";
import React, { ReactNode, useCallback, useMemo } from "react";
import { GetBalanceStatsResponseType } from "../../api/stats/balance/route";
import { useQuery } from "@tanstack/react-query";
import { dateToUTCDate, getFormatterForCurrency } from "@/lib/helpers";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import CountUp from "react-countup";

interface Props {
  from: Date;
  to: Date;
  userSettings: UserSettings;
}

export default function StatsCards({ from, to, userSettings }: Props) {
  const statsQuery = useQuery<GetBalanceStatsResponseType>({
    queryKey: ["overview", "stats", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/balance?from=${dateToUTCDate(from)}&to=${dateToUTCDate(to)}`
      ).then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch stats data");
        }
        return res.json();
      }),
    retry: 1,
  });

  const formatter = useMemo(
    () => getFormatterForCurrency(userSettings.currency),
    [userSettings.currency]
  );

  const income = statsQuery.data?.income || 0;
  const expense = statsQuery.data?.expense || 0;
  const balance = income - expense;

  const renderStatCard = (title: string, value: number, icon: ReactNode) => (
    <SkeletonWrapper isLoading={statsQuery.isFetching}>
      <StatCard formatter={formatter} value={value} title={title} icon={icon} />
    </SkeletonWrapper>
  );

  return (
    <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
      {renderStatCard(
        "Income",
        income,
        <TrendingUp
          className="h-12 w-12 rounded-lg p-2 text-emerald-500 bg-emerald-400/10"
          aria-hidden="true"
        />
      )}
      {renderStatCard(
        "Expense",
        expense,
        <TrendingDown
          className="h-12 w-12 rounded-lg p-2 text-rose-500 bg-rose-400/10"
          aria-hidden="true"
        />
      )}
      {renderStatCard(
        "Balance",
        balance,
        <Wallet
          className="h-12 w-12 rounded-lg p-2 text-violet-500 bg-violet-400/10"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function StatCard({
  formatter,
  value,
  title,
  icon,
}: {
  formatter: Intl.NumberFormat;
  value: number;
  title: string;
  icon: ReactNode;
}) {
  const formatFn = useCallback(
    (value: number) => formatter.format(value),
    [formatter]
  );

  return (
    <Card
      className="flex h-24 w-full items-center gap-2 p-4"
      aria-label={`Stat card for ${title}`}
    >
      {icon}
      <div className="flex flex-col items-start gap-0">
        <p className="text-muted-foreground">{title}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className="text-2xl"
        />
      </div>
    </Card>
  );
}
