"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "cn";

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface DropdownSelectProps {
  value: string;
  onValueChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export function DropdownSelect({
  value,
  onValueChange,
  options,
  placeholder = "Pilih opsi...",
  className,
  buttonClassName,
  disabled = false,
}: DropdownSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "inline-flex shrink-0 items-center justify-between rounded-lg border border-border bg-background px-2.5 h-8 font-semibold text-xs text-foreground hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 cursor-pointer disabled:pointer-events-none disabled:opacity-50",
          buttonClassName
        )}
      >
        <span className="truncate flex items-center gap-1.5 text-foreground">
          {selectedOption ? (
            <>
              {selectedOption.icon}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronDown className="size-3.5 opacity-60 ml-2 shrink-0" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("p-1 w-44 bg-popover border border-border shadow-md rounded-lg", className)}
      >
        <div className="flex flex-col gap-0.5">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between w-full px-2.5 py-1.5 text-xs rounded-md text-left transition-colors font-medium cursor-pointer",
                  isSelected
                    ? "bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon}
                  <div>
                    <div className="truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-[10px] text-muted-foreground truncate">{option.description}</div>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="size-3.5 text-purple-600 shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
