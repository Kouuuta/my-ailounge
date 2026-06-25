"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatternDetail {
  pattern_key: string;
  description: string;
  total: number;
  errors_only: number;
  timeline: { date: string; count: number }[];
  methods: { method: string; count: number }[];
}

export function PatternDrillDown({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patternId = searchParams.get("pattern");

  const [detail, setDetail] = useState<PatternDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const close = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("pattern");
    router.push(`/logs?${p.toString()}`);
  }, [router, searchParams]);

  const fetchDetail = useCallback(async (pid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs/${analysisId}/patterns/${pid}`);
      if (res.ok) setDetail(await res.json());
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    if (patternId) {
      fetchDetail(patternId);
    } else {
      setDetail(null);
    }
  }, [patternId, fetchDetail]);

  const maxTimelineCount = detail
    ? Math.max(...detail.timeline.map((t) => t.count), 1)
    : 1;

  return (
    <>
      {patternId && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />
      )}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l bg-background shadow-2xl transition-transform duration-300 ${
          patternId ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {patternId && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold truncate">
                {detail?.description || "Pattern Details"}
              </h2>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={close}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : detail ? (
                <div className="space-y-4 p-4">
                  <div className="flex gap-3">
                    <div className="rounded-lg border px-3 py-2 flex-1">
                      <p className="text-xs text-muted-foreground">Total occurrences</p>
                      <p className="text-xl font-bold tabular-nums">{detail.total}</p>
                    </div>
                    <div className="rounded-lg border px-3 py-2 flex-1">
                      <p className="text-xs text-muted-foreground">Errors only</p>
                      <p className="text-xl font-bold tabular-nums">{detail.errors_only}</p>
                    </div>
                  </div>

                  {detail.timeline.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Timeline
                      </p>
                      <div className="space-y-1">
                        {detail.timeline.map((t) => (
                          <div key={t.date} className="flex items-center gap-2">
                            <span className="w-24 shrink-0 text-xs tabular-nums text-muted-foreground">
                              {t.date}
                            </span>
                            <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                              <div
                                className="h-full rounded bg-accent-vibrant/60 transition-all"
                                style={{ width: `${(t.count / maxTimelineCount) * 100}%` }}
                              />
                            </div>
                            <span className="w-8 shrink-0 text-right text-xs tabular-nums font-medium">
                              {t.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detail.methods.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Methods
                      </p>
                      <div className="space-y-1">
                        {detail.methods.map((m) => (
                          <div key={m.method} className="flex items-center justify-between text-sm">
                            <span className="font-mono text-xs truncate">{m.method}</span>
                            <span className="tabular-nums text-muted-foreground ml-4">{m.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
