"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PERIODS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-7", label: "Last 7 Days" },
  { value: "last-30", label: "Last 30 Days" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "custom", label: "Custom Date Range..." },
];

export function getPeriodLabel(value: string): string {
  const period = PERIODS.find((p) => p.value === value);
  return period?.label ?? "All Time";
}

export function getDateRange(
  period: string,
): { from_date?: string; to_date?: string } {
  const now = new Date();
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  switch (period) {
    case "today":
      return {
        from_date: startOfDay(now).toISOString(),
        to_date: endOfDay(now).toISOString(),
      };
    case "yesterday": {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      return {
        from_date: startOfDay(d).toISOString(),
        to_date: endOfDay(d).toISOString(),
      };
    }
    case "last-7": {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return {
        from_date: startOfDay(from).toISOString(),
        to_date: now.toISOString(),
      };
    }
    case "last-30": {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      return {
        from_date: startOfDay(from).toISOString(),
        to_date: now.toISOString(),
      };
    }
    case "this-month":
      return {
        from_date: new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        ).toISOString(),
        to_date: now.toISOString(),
      };
    case "last-month": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return {
        from_date: first.toISOString(),
        to_date: last.toISOString(),
      };
    }
    default:
      return {};
  }
}

function formatDateRange(range: { from: string; to: string }): string {
  const f = new Date(range.from + "T00:00:00");
  const t = new Date(range.to + "T00:00:00");
  const sameMonth = f.getMonth() === t.getMonth() && f.getFullYear() === t.getFullYear();
  if (sameMonth) {
    return `${f.toLocaleDateString("en-US", { month: "short" })} ${f.getDate()} – ${t.getDate()}, ${f.getFullYear()}`;
  }
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${f.toLocaleDateString("en-US", opts)} – ${t.toLocaleDateString("en-US", opts)}`;
}

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  customDateRange?: { from: string; to: string } | null;
  onCustomDateRangeApply?: (range: { from: string; to: string }) => void;
}

export function DateFilter({ value, onChange, resultCount, customDateRange, onCustomDateRangeApply }: DateFilterProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const isCustomActive = value === "custom" && !!customDateRange;
  const isFiltered = value !== "all" && (value !== "custom" || isCustomActive);

  const handleValueChange = (newVal: string) => {
    if (newVal === "custom") {
      setCustomFrom(customDateRange?.from || "");
      setCustomTo(customDateRange?.to || "");
      setShowCustom(true);
    } else {
      onChange(newVal);
      setShowCustom(false);
    }
  };

  const handleApplyCustom = () => {
    if (customFrom && customTo && onCustomDateRangeApply) {
      onCustomDateRangeApply({ from: customFrom, to: customTo });
      onChange("custom");
    }
    setShowCustom(false);
  };

  const handleCancelCustom = () => {
    onChange("all");
    setShowCustom(false);
  };

  return (
    <div className="flex items-center gap-2 relative">
      <Select value={value === "custom" ? "custom" : value} onValueChange={handleValueChange}>
        <SelectTrigger className="h-9 w-[160px] text-xs">
          <SelectValue placeholder="All Time">
            {isCustomActive && customDateRange ? formatDateRange(customDateRange) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((p) => (
            <SelectItem key={p.value} value={p.value} className="text-xs">
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCustom && (
        <div className="absolute top-full mt-1 z-50 rounded-lg border bg-card p-3 shadow-md w-64">
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground block mb-0.5">From</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-0.5">To</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleCancelCustom}
                className="text-xs px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustom}
                disabled={!customFrom || !customTo}
                className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {isFiltered && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {resultCount !== undefined
            ? `${resultCount} analysis${resultCount !== 1 ? "es" : ""} · ${getPeriodLabel(value)}`
            : getPeriodLabel(value)}
        </span>
      )}
    </div>
  );
}
