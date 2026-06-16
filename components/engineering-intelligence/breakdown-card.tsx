"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";

export interface BreakdownItem {
  name: string;
  count: number;
}

interface BreakdownCardProps {
  sources: BreakdownItem[];
  categories: BreakdownItem[];
  total: number;
  delay?: number;
}

function BreakdownList({
  items,
  total,
}: {
  items: BreakdownItem[];
  total: number;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No data yet.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium">{item.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {item.count}
                <span className="text-xs ml-1">({pct}%)</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent-vibrant/60 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BreakdownCard({
  sources,
  categories,
  total,
  delay = 0,
}: BreakdownCardProps) {
  return (
    <Card
      className="transition-all duration-300 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-vibrant/10">
            <BarChart3 className="h-4 w-4 text-accent-vibrant" />
          </div>
          <CardTitle className="text-lg">Feed Breakdown</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sources">
          <TabsList className="w-full">
            <TabsTrigger value="sources" className="flex-1">
              By Source
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">
              By Category
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sources" className="mt-4">
            <BreakdownList items={sources} total={total} />
          </TabsContent>
          <TabsContent value="categories" className="mt-4">
            <BreakdownList items={categories} total={total} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
