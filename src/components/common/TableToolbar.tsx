"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface FilterOption {
  label: string;
  value: string;
}

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  categoryFilter?: string;
  onCategoryChange?: (value: string) => void;
  categoryOptions?: FilterOption[];
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  totalResults?: number;
  onResetFilters?: () => void;
}

export function TableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cari data...",
  categoryFilter,
  onCategoryChange,
  categoryOptions,
  statusFilter,
  onStatusChange,
  statusOptions,
  totalResults,
  onResetFilters,
}: TableToolbarProps) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    (categoryFilter && categoryFilter !== "ALL") ||
    (statusFilter && statusFilter !== "ALL");

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border border-border rounded-2xl shadow-2xs">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search Input Field */}
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8.5 pr-8 h-9 text-xs bg-background/50 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Optional Category Dropdown */}
        {categoryOptions && onCategoryChange && (
          <div className="relative">
            <select
              value={categoryFilter || "ALL"}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-9 px-3 pr-8 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer appearance-none"
            >
              <option value="ALL">Semua Kategori</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="size-3 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Optional Status Dropdown */}
        {statusOptions && onStatusChange && (
          <div className="relative">
            <select
              value={statusFilter || "ALL"}
              onChange={(e) => onStatusChange(e.target.value)}
              className="h-9 px-3 pr-8 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer appearance-none"
            >
              <option value="ALL">Semua Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="size-3 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Reset Action */}
        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-bold text-muted-foreground hover:text-red-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      {typeof totalResults === "number" && (
        <div className="text-[11px] font-bold text-muted-foreground text-right tabular-nums whitespace-nowrap px-1">
          {totalResults} data ditemukan
        </div>
      )}
    </div>
  );
}
