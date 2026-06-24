"use client";

import { ResponsivePie } from "@nivo/pie";

interface SourceBreakdownProps {
  acuityErrors: number;
  zohoErrors: number;
}

const SOURCE_META: Record<string, { label: string; color: string }> = {
  acuity: { label: "Acuity", color: "#f59e0b" },
  zoho: { label: "Zoho", color: "#3b82f6" },
};

export function SourceBreakdown({ acuityErrors, zohoErrors }: SourceBreakdownProps) {
  const total = acuityErrors + zohoErrors;
  const hasMultipleSources = acuityErrors > 0 && zohoErrors > 0;

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        No source data
      </div>
    );
  }

  if (hasMultipleSources) {
    const data = [
      { id: "Acuity", label: "Acuity", value: acuityErrors, color: "#f59e0b" },
      { id: "Zoho", label: "Zoho", value: zohoErrors, color: "#3b82f6" },
    ];

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

  const sourceKey = acuityErrors > 0 ? "acuity" : "zoho";
  const { label, color } = SOURCE_META[sourceKey];
  const sourceErrors = sourceKey === "acuity" ? acuityErrors : zohoErrors;

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold tabular-nums text-white"
          style={{ backgroundColor: color }}
        >
          {sourceErrors}
        </div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {sourceErrors.toLocaleString()} errors
        </p>
      </div>
    </div>
  );
}
