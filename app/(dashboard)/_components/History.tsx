"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Period, Timeframe } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { getFormatterForCurrency } from "@/lib/helpers";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";

export default function History({
  userSettings,
}: {
  userSettings: UserSettings;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [period, setPeriod] = useState<Period>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const formatter = useMemo(
    () => getFormatterForCurrency(userSettings.currency),
    [userSettings.currency]
  );

  const historyDataQuery = useQuery({
    queryKey: ["overview", "history", timeframe, period],
    queryFn: () =>
      fetch(
        `/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`
      ).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch history data");
        return res.json();
      }),
  });

  const dataAvailable = historyDataQuery.data?.length > 0;

  return (
    <div className="container">
      <h2 className="mt-12 text-3xl font-bold">History</h2>
      <Card className="col-span-12 mt-2 w-full">
        <CardHeader className="gap-2">
          <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
            <HistoryPeriodSelector
              period={period}
              setPeriod={setPeriod}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
            <Legend />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonWrapper isLoading={historyDataQuery.isFetching}>
            {dataAvailable ? (
              <HistoryChart
                data={historyDataQuery.data}
                formatter={formatter}
                timeframe={timeframe}
              />
            ) : (
              <EmptyState />
            )}
          </SkeletonWrapper>
        </CardContent>
      </Card>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex h-10 gap-2">
      <Badge variant="outline" className="flex items-center gap-2 text-sm">
        <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
        Income
      </Badge>
      <Badge variant="outline" className="flex items-center gap-2 text-sm">
        <div className="h-4 w-4 rounded-full bg-rose-500"></div>
        Expense
      </Badge>
    </div>
  );
}

function HistoryChart({
  data,
  formatter,
  timeframe,
}: {
  data: any[];
  formatter: Intl.NumberFormat;
  timeframe: Timeframe;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart height={300} data={data} barCategoryGap={5}>
        <defs>
          <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#10b981" stopOpacity={0.9} />
            <stop offset="1" stopColor="#047857" stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f87171" stopOpacity={0.9} />
            <stop offset="1" stopColor="#b91c1c" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="5 5"
          strokeOpacity={0.2}
          vertical={false}
        />
        <XAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          padding={{ left: 5, right: 5 }}
          dataKey={(data) => {
            const { year, month, day } = data;
            const date = new Date(year, month, day || 1);
            return timeframe === "year"
              ? date.toLocaleString("default", { month: "long" })
              : date.toLocaleString("default", { day: "2-digit" });
          }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Bar
          dataKey="income"
          label="Income"
          fill="url(#incomeBar)"
          radius={4}
          className="cursor-pointer"
        />
        <Bar
          dataKey="expense"
          label="Expense"
          fill="url(#expenseBar)"
          radius={4}
          className="cursor-pointer"
        />
        <Tooltip
          cursor={{ opacity: 0.1 }}
          content={(props) => (
            <CustomTooltip formatter={formatter} {...props} />
          )}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return (
    <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
      No data for the selected period
      <p className="text-sm text-muted-foreground">
        Try selecting a different period or adding new transactions
      </p>
    </Card>
  );
}

function CustomTooltip({ active, payload, formatter }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const { expense, income } = payload[0].payload;

  return (
    <div className="min-w-[300px] rounded border bg-background p-4">
      <TooltipRow
        formatter={formatter}
        label="Expense"
        value={expense}
        bgColor="bg-rose-500"
        textColor="text-rose-500"
      />
      <TooltipRow
        formatter={formatter}
        label="Income"
        value={income}
        bgColor="bg-emerald-500"
        textColor="text-emerald-500"
      />
      <TooltipRow
        formatter={formatter}
        label="Balance"
        value={income - expense}
        bgColor="bg-gray-100"
        textColor="text-foreground"
      />
    </div>
  );
}

function TooltipRow({
  label,
  value,
  bgColor,
  textColor,
  formatter,
}: {
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
  formatter: Intl.NumberFormat;
}) {
  const formattingFn = useCallback(
    () => formatter.format(value),
    [formatter, value]
  );

  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-4 w-4 rounded-full", bgColor)} />
      <div className="flex w-full justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={cn("text-sm font-bold", textColor)}>
          <CountUp
            duration={0.5}
            preserveValue
            end={value}
            decimals={0}
            formattingFn={formattingFn}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
