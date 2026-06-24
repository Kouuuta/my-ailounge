"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PatternDetail {
  pattern_key: string;
  description: string;
  total: number;
  errors_only: number;
  timeline: { date: string; count: number }[];
  methods: { method: string; count: number }[];
  sample_error: { id: number; raw_message: string; timestamp: string } | null;
}

interface ErrorRow {
  id: number;
  method: string;
  action: string;
  content: string;
  error_type: string;
  error_code: string;
  raw_message: string;
  timestamp: string;
  is_error: number;
}

interface ErrorListResponse {
  rows: ErrorRow[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
}

export function PatternDrillDown({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patternKey = searchParams.get("pattern");

  const [detail, setDetail] = useState<PatternDetail | null>(null);
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [errorsLoading, setErrorsLoading] = useState(false);

  const close = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("pattern");
    router.push(`/logs?id=${analysisId}${p.toString() ? "&" + p.toString() : ""}`);
  }, [router, searchParams, analysisId]);

  const fetchDetail = useCallback(async (pid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/logs/${analysisId}/patterns/${pid}`);
      if (res.ok) setDetail(await res.json());
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  const fetchErrors = useCallback(async (pid: string, page: number) => {
    setErrorsLoading(true);
    try {
      const res = await fetch(`/api/logs/${analysisId}/patterns/${pid}/errors?page=${page}&limit=25`);
      if (res.ok) {
        const data: ErrorListResponse = await res.json();
        setErrors(data.rows);
        setPagination(data.pagination);
      }
    } finally {
      setErrorsLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    if (patternKey) {
      fetchDetail(patternKey);
      fetchErrors(patternKey, 1);
    } else {
      setDetail(null);
      setErrors([]);
    }
  }, [patternKey, fetchDetail, fetchErrors]);

  const maxTimelineCount = detail
    ? Math.max(...detail.timeline.map((t) => t.count), 1)
    : 1;

  return (
    <>
      {patternKey && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />
      )}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l bg-background shadow-2xl transition-transform duration-300 ${
          patternKey ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {patternKey && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold truncate">
                {detail?.description || patternKey}
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
                    <>
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
                      <Separator />
                    </>
                  )}

                  {detail.methods.length > 0 && (
                    <>
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
                      <Separator />
                    </>
                  )}

                  {detail.sample_error && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Sample Error
                      </p>
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-[11px] text-muted-foreground font-mono whitespace-pre-wrap break-all leading-relaxed">
                          {detail.sample_error.raw_message}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground/60">
                          #{detail.sample_error.id} — {detail.sample_error.timestamp}
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Error Rows
                      <span className="ml-1.5 font-normal normal-case text-muted-foreground/60">
                        ({pagination.total})
                      </span>
                    </p>

                    {errorsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : errors.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">No error rows</p>
                    ) : (
                      <div className="space-y-1.5">
                        {errors.map((err) => (
                          <div key={err.id} className="rounded-md border px-2.5 py-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                {err.raw_message || err.error_type}
                              </span>
                              {err.is_error ? (
                                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />
                              ) : null}
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                              {err.method && <span className="font-mono">{err.method}</span>}
                              {err.action && <span>· {err.action}</span>}
                              {err.timestamp && <span>· {err.timestamp}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {pagination.total_pages > 1 && (
                      <div className="mt-3 flex items-center justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={pagination.page <= 1 || errorsLoading}
                          onClick={() => {
                            if (patternKey) fetchErrors(patternKey, pagination.page - 1);
                          }}
                        >
                          Prev
                        </Button>
                        <span className="px-2 text-xs tabular-nums text-muted-foreground">
                          {pagination.page} / {pagination.total_pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={pagination.page >= pagination.total_pages || errorsLoading}
                          onClick={() => {
                            if (patternKey) fetchErrors(patternKey, pagination.page + 1);
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
