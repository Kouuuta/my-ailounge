"use client";

import { ResponsivePie } from "@nivo/pie";

interface SourceBreakdownProps {
  acuityErrors: number;
  zohoErrors: number;
}

export function SourceBreakdown({ acuityErrors, zohoErrors }: SourceBreakdownProps) {
  const data = [
    { id: "Acuity", label: "Acuity", value: acuityErrors, color: "#f59e0b" },
    { id: "Zoho", label: "Zoho", value: zohoErrors, color: "#3b82f6" },
  ];

  const total = acuityErrors + zohoErrors;

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        No source data
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsivePie
        data={data}
        margin={{ top: 10, right: 80, bottom: 10, left: 10 }}
        innerRadius={0.55}
        padAngle={2}
        cornerRadius={4}
        activeOuterRadiusOffset={8}
        colors={{ datum: "data.color" }}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        enableArcLinkLabels
        arcLinkLabel="label"
        arcLinkLabelsTextColor="var(--color-foreground)"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        enableArcLabels
        arcLabelsSkipAngle={20}
        arcLabelsTextColor="white"
        arcLabel={(d) => `${((d.value / total) * 100).toFixed(0)}%`}
        tooltip={({ datum }) => (
          <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
            <span className="font-medium">{datum.label}</span>: {datum.value.toLocaleString()} errors ({(datum.value / total * 100).toFixed(1)}%)
          </div>
        )}
        theme={{
          axis: { ticks: { text: { fill: "var(--color-muted-foreground)" } } },
          grid: { line: { stroke: "var(--color-border)" } },
        }}
      />
    </div>
  );
}
