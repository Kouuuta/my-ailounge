"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

interface IngestResult {
  ok: boolean;
  inserted: number;
  elapsed: number;
}

export function IngestButton() {
  const [running, setRunning] = useState(false);

  const handleIngest = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error("Ingestion failed", {
          description: data.error || "Unknown error",
        });
        return;
      }

      const results = data.results as Record<string, IngestResult>;

      if (data.allOk) {
        const details = Object.entries(results)
          .map(([k, v]) => `${k}: ${v.inserted} items`)
          .join(", ");
        toast.success("Ingestion complete", { description: details });
      } else {
        const failed = Object.entries(results)
          .filter(([, v]) => !v.ok)
          .map(([k]) => `"${k}"`)
          .join(", ");
        toast.error("Some sources failed", {
          description: `${failed} — check server logs`,
        });
      }
    } catch {
      toast.error("Ingestion request failed", {
        description: "Could not reach the server",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Button onClick={handleIngest} disabled={running} size="sm">
      {running ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      {running ? "Ingesting..." : "Ingest"}
    </Button>
  );
}
