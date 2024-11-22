"use client";

import { DatetoUTCDate } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface Props {
  from: Date;
  to: Date;
}

export default function TransactionTable({ from, to }: Props) {
  const history = useQuery({
    queryKey: ["transactions", "history", from, to],
    queryFn: () =>
      fetch(
        `/api/transactions-history?from=${DatetoUTCDate(
          from
        )}&to=${DatetoUTCDate(to)}`
      ).then((res) => res.json()),
  });
  return <div></div>;
}
