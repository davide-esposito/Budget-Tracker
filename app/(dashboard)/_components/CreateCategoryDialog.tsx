"use client";

import React, { useCallback, useState } from "react";
import { TransactionType } from "@/lib/types";
import { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CircleOff, Loader2, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
} from "../../../schema/categories";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateCategory } from "../_actions/categories";
import { Category } from "@prisma/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface Props {
  type: TransactionType;
  successCallback: (category: Category) => void;
  trigger?: ReactNode;
}

export default function CreateCategoryDialog({
  type,
  successCallback,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      type,
    },
  });

  const queryClient = useQueryClient();
  const theme = useTheme();

  const { mutate, isPending } = useMutation({
    mutationFn: CreateCategory,
    onSuccess: async (data: Category) => {
      form.reset({
        name: "",
        icon: "",
        type,
      });

      toast.success(`Category ${data.name} created successfully 🎉`, {
        id: "create-category",
      });

      successCallback(data);

      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      setOpen(false);
    },
    onError: () => {
      toast.error("An error occurred while creating the category", {
        id: "create-category",
      });
    },
  });

  const onSubmit = useCallback(
    (values: CreateCategorySchemaType) => {
      toast.loading("Creating category...", {
        id: "create-category",
      });
      mutate(values);
    },
    [mutate]
  );

  const RenderNameField = () => (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="name">Name</FormLabel>
          <FormControl>
            <Input
              id="name"
              aria-label="Category name"
              placeholder="Category"
              {...field}
            />
          </FormControl>
          <FormDescription>
            The name of your category as it will appear in your lists.
          </FormDescription>
        </FormItem>
      )}
    />
  );

  const RenderIconField = () => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    return (
      <FormField
        control={form.control}
        name="icon"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="icon">Icon</FormLabel>
            <FormControl>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="icon"
                    aria-label="Select category icon"
                    variant="outline"
                    className="h-[100px] w-full"
                  >
                    {form.watch("icon") ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-5xl" role="img">
                          {field.value}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <CircleOff className="h-[48px] w-[48px]" />
                        <p className="text-xs text-muted-foreground">
                          Click to select
                        </p>
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full">
                  <Picker
                    data={data}
                    theme={theme.resolvedTheme}
                    onEmojiSelect={(emoji: { native: string }) => {
                      field.onChange(emoji.native);
                      setPopoverOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormDescription>
              Choose an icon to visually represent your category.
            </FormDescription>
          </FormItem>
        )}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            aria-label="Open create category dialog"
            className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Create new
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {type}
            </span>
            category
          </DialogTitle>
          <DialogDescription>
            Categories are used to group your transactions
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {RenderNameField()}
            {RenderIconField()}
          </form>
        </Form>
        <DialogFooter>
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
            aria-label="Create category"
          >
            {!isPending ? "Create" : <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
