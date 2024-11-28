"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TransactionType } from "@/lib/types";
import { Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { cn } from "@/lib/utils";

interface Props {
  type: TransactionType;
  onChange: (value: string) => void;
}

export default function CategoryPicker({ type, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (value) {
      onChange(value);
    }
  }, [value, onChange]);

  const { data: categories, isError } = useQuery<Category[]>({
    queryKey: ["categories", type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      }),
    retry: 1,
  });

  const successCallback = useCallback((category: Category) => {
    setValue(category.name);
    setOpen(false);
  }, []);

  const selectedCategory = categories?.find(
    (category) => category.name === value
  );

  const renderCategoryList = () => (
    <CommandGroup>
      <CommandList>
        {categories?.map((category) => (
          <CommandItem
            key={category.name}
            onSelect={() => {
              setValue(category.name);
              setOpen(false);
            }}
          >
            <CategoryRow category={category} />
            <Check
              className={cn(
                "mr-2 w-4 opacity-0",
                value === category.name && "opacity-100"
              )}
            />
          </CommandItem>
        ))}
      </CommandList>
    </CommandGroup>
  );

  const renderEmptyState = () => (
    <CommandEmpty>
      <p>Category not found</p>
      <p className="text-xs text-muted-foreground">
        Tip: Create a new category
      </p>
    </CommandEmpty>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls="category-popover"
          className="w-[200px] justify-between"
        >
          {selectedCategory ? (
            <CategoryRow category={selectedCategory} />
          ) : (
            "Select category"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent id="category-popover" className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="Search category..."
            aria-label="Search categories"
          />
          <CreateCategoryDialog type={type} successCallback={successCallback} />
          {categories?.length ? renderCategoryList() : renderEmptyState()}
          {isError && (
            <p className="text-sm text-red-500">Failed to load categories.</p>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function CategoryRow({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-2">
      <span role="img" aria-label={`${category.name} icon`}>
        {category.icon}
      </span>
      <span>{category.name}</span>
    </div>
  );
}
