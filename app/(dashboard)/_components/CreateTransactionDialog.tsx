"use client";

import React, { useCallback, useState } from "react";
import { TransactionType } from "@/lib/types";
import { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "../../../schema/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "./CategoryPicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import format from "date-fns/format";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "../_actions/transactions";
import { toast } from "sonner";
import { dateToUTCDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}

export default function CreateTransactionDialog({ trigger, type }: Props) {
  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      date: new Date(),
      description: "",
      amount: 0,
      category: "",
    },
  });

  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success("Transaction created successfully 🎉", {
        id: "create-transaction",
      });

      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["overview"],
      });
      setOpen(false);
    },
    onError: () => {
      toast.error("An error occurred while creating the transaction.", {
        id: "create-transaction",
      });
    },
  });

  const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
      toast.loading("Creating transaction...", { id: "create-transaction" });
      mutate({ ...values, date: dateToUTCDate(values.date) });
    },
    [mutate]
  );

  const renderDescriptionField = () => (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="description">Description</FormLabel>
          <FormControl>
            <Input
              id="description"
              aria-label="Transaction description"
              placeholder="Description"
              {...field}
            />
          </FormControl>
          <FormDescription>Transaction description (optional)</FormDescription>
        </FormItem>
      )}
    />
  );

  const renderAmountField = () => (
    <FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="amount">Amount</FormLabel>
          <FormControl>
            <Input
              id="amount"
              aria-label="Transaction amount"
              type="number"
              placeholder="Amount"
              {...field}
            />
          </FormControl>
          <FormDescription>Transaction amount (required)</FormDescription>
        </FormItem>
      )}
    />
  );

  const renderCategoryPicker = () => (
    <FormField
      control={form.control}
      name="category"
      render={({}) => (
        <FormItem>
          <FormLabel htmlFor="category">Category</FormLabel>
          <FormControl>
            <CategoryPicker
              type={type}
              onChange={(value) => form.setValue("category", value)}
            />
          </FormControl>
          <FormDescription>
            Select a category for this transaction
          </FormDescription>
        </FormItem>
      )}
    />
  );

  const renderDatePicker = () => (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="date">Transaction Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                aria-label="Select transaction date"
                className={cn("w-full pl-3 text-left font-normal")}
              >
                {field.value ? format(field.value, "PPP") : "Pick a date"}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(value) => field.onChange(value)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormDescription>Select a date for this transaction</FormDescription>
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen} aria-labelledby="dialog-title">
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>
            Create a new
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {type}
            </span>
            transaction
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {renderDescriptionField()}
            {renderAmountField()}
            <div className="flex flex-col gap-4">
              {renderCategoryPicker()}
              {renderDatePicker()}
            </div>
          </form>
        </Form>
        <DialogFooter className="flex flex-col gap-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => form.reset()}
              aria-label="Cancel"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {!isPending ? "Create" : <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
