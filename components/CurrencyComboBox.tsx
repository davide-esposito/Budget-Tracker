"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Currency, currencies } from "@/lib/currencies";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserSettings } from "@prisma/client";
import UpdateUserCurrency from "@/actions/userSettings";

export default function CurrencyComboBox() {
  const [open, setOpen] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [selectedOption, setSelectedOption] = useState<Currency | null>(null);

  const { data: userSettingsData, isFetching } = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
  });

  useEffect(() => {
    if (!userSettingsData) return;
    const userCurrency = currencies.find(
      (currency) => currency.value === userSettingsData.currency
    );
    setSelectedOption(userCurrency || null);
  }, [userSettingsData]);

  const mutation = useMutation({
    mutationFn: (currency: string) => UpdateUserCurrency(currency),
    onSuccess: (data: UserSettings) => {
      toast.success("Currency updated successfully 🎉", {
        id: "update-currency",
      });
      const newCurrency = currencies.find(
        (currency) => currency.value === data.currency
      );
      setSelectedOption(newCurrency || null);
    },
    onError: () => {
      toast.error("Something went wrong while updating currency.", {
        id: "update-currency",
      });
    },
  });

  const selectOption = useCallback(
    (currency: Currency | null) => {
      if (!currency) {
        toast.error("Please select a valid currency.");
        return;
      }
      toast.loading("Updating currency...", { id: "update-currency" });
      mutation.mutate(currency.value);
    },
    [mutation]
  );

  return (
    <SkeletonWrapper isLoading={isFetching}>
      {isDesktop ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={mutation.isPending}
              aria-haspopup="true"
              aria-expanded={open}
              aria-label="Select currency"
            >
              {selectedOption?.label || "Set currency"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionList
              currencies={currencies}
              setOpen={setOpen}
              setSelectedOption={selectOption}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={mutation.isPending}
              aria-haspopup="true"
              aria-expanded={open}
              aria-label="Select currency"
            >
              {selectedOption?.label || "Set currency"}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mt-4 border-t">
              <OptionList
                currencies={currencies}
                setOpen={setOpen}
                setSelectedOption={selectOption}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </SkeletonWrapper>
  );
}

function OptionList({
  currencies,
  setOpen,
  setSelectedOption,
}: {
  currencies: Currency[];
  setOpen: (open: boolean) => void;
  setSelectedOption: (currency: Currency | null) => void;
}) {
  return (
    <Command>
      <CommandInput
        placeholder="Filter currencies..."
        aria-label="Filter currencies"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {currencies.map((currency) => (
            <CommandItem
              key={currency.value}
              value={currency.value}
              onSelect={() => {
                setSelectedOption(currency);
                setOpen(false);
              }}
              aria-selected={false}
            >
              {currency.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
