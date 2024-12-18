"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { UserSettings } from "@prisma/client";
import { differenceInDays, startOfMonth } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import StatsCards from "./StatsCards";
import CategorieStats from "./CategorieStats";

export default function Overview({
  userSettings,
}: {
  userSettings: UserSettings;
}) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const handleDateRangeUpdate = (values: {
    range: { from?: Date; to?: Date };
  }) => {
    const { from, to } = values.range;

    if (!from || !to) return;

    if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
      toast.error(`Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days`);
      return;
    }

    setDateRange({ from, to });
  };

  return (
    <>
      <div className="container flex flex-wrap items-end justify-between gap-2 py-6">
        <h2 className="text-3xl font-bold">Overview</h2>
        <div className="flex items-center gap-3">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={handleDateRangeUpdate}
            aria-label="Select a date range for your overview"
          />
        </div>
      </div>
      <div className="container flex w-full flex-col gap-2">
        <StatsCards
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />
        <CategorieStats
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />
      </div>
    </>
  );
}
