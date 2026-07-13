"use client";

import { Search } from "lucide-react";

interface PatternSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PatternSearch({ value, onChange, placeholder }: PatternSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search error messages..."}
        className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}
