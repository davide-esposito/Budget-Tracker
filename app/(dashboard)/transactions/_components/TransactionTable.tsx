"use client";

import { DatetoUTCDate } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DownloadIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import DataTableColumnHeader from "@/components/datatable/ColumnHeader";
import { cn } from "@/lib/utils";
import { DataTableFacetedFilter } from "@/components/datatable/FacetedFilters";
import DataTableViewOptions from "@/components/datatable/ColumnToggle";
import { generateCsv, download, mkConfig } from "export-to-csv";
import DeleteTransactionDialog from "./DeleteTransactionDialog";

export type GetTransactionsHistoryResponseType = {
  id: string;
  category: string;
  categoryIcon: string;
  amount: number;
  type: string;
  date: Date;
  formattedAmount: string;
}[];

interface Props {
  from: Date;
  to: Date;
}

const columns: ColumnDef<GetTransactionsHistoryResponseType[0]>[] = [
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id);
      return filterValue.includes(value);
    },
    cell: ({ row }) => (
      <div className="flex gap-2 capitalize">
        {row.original.categoryIcon} {"  "}
        {row.original.category}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id);
      return filterValue.includes(value);
    },
    cell: ({ row }) => (
      <div
        className={cn(
          "capitalize rounded-lg text-center p-2",
          row.original.type === "income" &&
            "bg-emerald-400/10 text-emerald-500",
          row.original.type === "expense" && "bg-rose-400/10 text-rose-500"
        )}
      >
        {row.original.type}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">
        {row.original.formattedAmount}
      </p>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const formattedDate = new Date(row.original.date).toLocaleDateString(
        "default",
        {
          timeZone: "UTC",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      );
      return <div className="text-muted-foreground">{formattedDate}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions transaction={row.original} />,
  },
];

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

export default function TransactionTable({ from, to }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const history = useQuery<GetTransactionsHistoryResponseType>({
    queryKey: ["transactions", "history", from, to],
    queryFn: async () => {
      const res = await fetch(
        `/api/transactions-history?from=${DatetoUTCDate(
          from
        )}&to=${DatetoUTCDate(to)}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch transaction history");
      }
      return (await res.json()) as GetTransactionsHistoryResponseType;
    },
  });

  const categoriesOptions = useMemo(() => {
    if (!history.data) return [];
    const categoriesMap = new Map();
    history.data.forEach((transaction) => {
      categoriesMap.set(transaction.category, {
        value: transaction.category,
        label: `${transaction.categoryIcon} ${transaction.category}`,
      });
    });
    return Array.from(categoriesMap.values());
  }, [history.data]);

  const table = useReactTable({
    data: history.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: (newSorting) => {
      setSorting(newSorting);
    },
    onColumnFiltersChange: (newFilters) => {
      setColumnFilters(newFilters);
    },
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handleExportCSV = () => {
    const data = table.getFilteredRowModel().rows.map((row) => ({
      category: row.original.category,
      type: row.original.type,
      amount: row.original.formattedAmount,
      date: new Date(row.original.date).toLocaleDateString(),
    }));
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 py-4">
        <div className="flex gap-2">
          {table.getColumn("category") && (
            <DataTableFacetedFilter
              title="Category"
              column={table.getColumn("category")}
              options={categoriesOptions}
            />
          )}
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              title="Type"
              column={table.getColumn("type")}
              options={[
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
              ]}
            />
          )}
        </div>
        <Button
          variant={"outline"}
          size={"sm"}
          className="ml-auto h-8 lg:flex bg-card"
          onClick={handleExportCSV}
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <DataTableViewOptions table={table} />
      </div>
      <SkeletonWrapper isLoading={history.isFetching}>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </SkeletonWrapper>
    </div>
  );
}

function RowActions({
  transaction,
}: {
  transaction: GetTransactionsHistoryResponseType[0];
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DeleteTransactionDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        transactionId={transaction.id}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Actions</span>
            <MoreHorizontalIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
            <TrashIcon className="w-4 h-4 text-muted-foreground" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
