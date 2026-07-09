"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layers, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StackStats {
  total: number;
  high: number;
  medium: number;
  low: number;
}

export function StackSummary() {
  const [stats, setStats] = useState<StackStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats({
          total: data.stackTotal ?? 0,
          high: data.stackHigh ?? 0,
          medium: data.stackMedium ?? 0,
          low: data.stackLow ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  if (!stats || stats.total === 0) return null;

  return (
    <Link href="/watchlist" className="block group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-accent-vibrant/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20">
              <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground font-display tracking-wide">
              Stack Watchlist
            </h3>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            {stats.high > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ShieldX className="h-3.5 w-3.5 text-rose-500" /> High
                </span>
                <span className="font-medium text-rose-500">{stats.high}</span>
              </div>
            )}
            {stats.medium > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Medium
                </span>
                <span className="font-medium text-amber-500">{stats.medium}</span>
              </div>
            )}
            {stats.low > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Low
                </span>
                <span className="font-medium text-emerald-500">{stats.low}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
