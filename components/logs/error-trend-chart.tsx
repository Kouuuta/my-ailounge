"use client";

import { ResponsiveBar } from "@nivo/bar";

interface ErrorTrendChartProps {
  data: { date: string; errors: number }[];
}

export function ErrorTrendChart({ data }: ErrorTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        No error trend data
      </div>
    );
  }

  const maxErrors = Math.max(...data.map((d) => d.errors));
  const tickValues = data.length > 10
    ? data.filter((_, i) => i % Math.ceil(data.length / 10) === 0).map((d) => d.date)
    : undefined;

  return (
    <div className="h-64">
      <ResponsiveBar
        data={data}
        keys={["errors"]}
        indexBy="date"
        margin={{ top: 10, right: 10, bottom: 40, left: 50 }}
        padding={0.3}
        colors={{ scheme: "reds" }}
        colorBy="indexValue"
        borderRadius={4}
        borderColor={{ from: "color", modifiers: [["darker", 1.4]] }}
        axisBottom={{
          tickValues,
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          format: (v: string) => v.substring(5),
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickValues: maxErrors > 5 ? undefined : [0, 1, 2, 3, 4, 5],
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        enableLabel={false}
        tooltip={({ indexValue, value }) => (
          <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
            <span className="font-medium">{String(indexValue)}</span>: {value} errors
          </div>
        )}
        theme={{
          axis: { ticks: { text: { fontSize: 11, fill: "var(--color-muted-foreground)" } } },
          grid: { line: { stroke: "var(--color-border)", strokeWidth: 1 } },
        }}
      />
    </div>
  );
}
