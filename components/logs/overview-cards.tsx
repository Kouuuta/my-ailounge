import { Card, CardContent } from "@/components/ui/card";

interface OverviewCardsProps {
  totalRows: number;
  errorCount: number;
  uniqueErrors: number;
  timeRangeStart: string;
  timeRangeEnd: string;
}

export function OverviewCards({ totalRows, errorCount, uniqueErrors, timeRangeStart, timeRangeEnd }: OverviewCardsProps) {
  const rate = totalRows > 0 ? ((errorCount / totalRows) * 100).toFixed(1) : "0.0";

  const cards = [
    { label: "Total Rows", value: totalRows.toLocaleString(), sub: `${timeRangeStart.substring(0, 10)} — ${timeRangeEnd.substring(0, 10)}` },
    { label: "Errors", value: errorCount.toLocaleString(), sub: `${uniqueErrors} unique types` },
    { label: "Error Rate", value: `${rate}%`, sub: `of all log entries` },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{card.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
