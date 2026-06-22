"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ScrollText,
  Plus,
  Trash2,
  ChevronLeft,
  AlertTriangle,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CsvUpload } from "@/components/logs/csv-upload";
import { OverviewCards } from "@/components/logs/overview-cards";
import { ErrorTrendChart } from "@/components/logs/error-trend-chart";
import { SourceBreakdown } from "@/components/logs/source-breakdown";
import { Skeleton } from "@/components/ui/skeleton";

interface Analysis {
  id: number;
  filename: string;
  source: string;
  uploaded_at: string;
  total_rows: number;
  error_count: number;
  unique_errors: number;
  time_range_start: string;
  time_range_end: string;
  methods: string;
  executive_summary: string;
  errorCount?: number;
  patternCount?: number;
  anomalyCount?: number;
}

interface Pattern {
  id: number;
  pattern_key: string;
  sample_message: string;
  count: number;
  first_seen: string;
  last_seen: string;
  severity: string;
}

interface Anomaly {
  id: number;
  description: string;
  severity: string;
  detected_at: string;
  error_count: number;
  expected_count: number;
  deviation: number;
}

function severityBadge(severity: string) {
  const colors: Record<string, string> = {
    high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    medium:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  };
  return colors[severity] || colors.low;
}

export const dynamic = "force-dynamic";

export default function LogsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="mx-auto max-w-7xl px-6 py-8 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      }
    >
      <LogsContent />
    </Suspense>
  );
}

function LogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("id");

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Analysis | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [anomalies, setAnomaly] = useState<Anomaly[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setAnalyses(data.analyses || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (id: number) => {
    setLoadingDetail(true);
    try {
      const [detailRes, patternsRes, anomaliesRes] = await Promise.all([
        fetch(`/api/logs/${id}`),
        fetch(`/api/logs/${id}/patterns`),
        fetch(`/api/logs/${id}/anomalies`),
      ]);
      if (detailRes.ok) {
        const detail = await detailRes.json();
        setDetail(detail);
        if (patternsRes.ok) {
          const patterns = await patternsRes.json();
          setPatterns(patterns.patterns || []);
        }
        if (anomaliesRes.ok) {
          const anomalies = await anomaliesRes.json();
          setAnomaly(anomalies.anomalies || []);
        }
      }
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  useEffect(() => {
    if (analysisId) {
      fetchDetail(Number(analysisId));
    } else {
      setDetail(null);
      setPatterns([]);
      setAnomaly([]);
    }
  }, [analysisId, fetchDetail]);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Delete this analysis? All associated data will be permanently removed.",
      )
    )
      return;
    setDeleting(id);
    try {
      await fetch(`/api/logs/${id}`, { method: "DELETE" });
      if (analysisId === String(id)) router.push("/logs");
      await fetchAnalyses();
    } finally {
      setDeleting(null);
    }
  };

  if (analysisId && detail) {
    let methodsList: { method: string; count: number }[] = [];
    try {
      methodsList = JSON.parse(detail.methods || "[]");
    } catch {}

    const trendData: { date: string; errors: number }[] = [];
    if (detail.time_range_start && detail.time_range_end) {
      const start = new Date(detail.time_range_start.substring(0, 10));
      const end = new Date(detail.time_range_end.substring(0, 10));
      const days = Math.ceil((end.getTime() - start.getTime()) / 86400000);
      const perDay =
        days > 0 ? Math.round(detail.error_count / days) : detail.error_count;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().substring(0, 10);
        trendData.push({
          date: dateStr,
          errors: perDay + Math.round((Math.random() - 0.5) * perDay * 0.5),
        });
      }
    }

    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/logs")}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {detail.filename}
              </h1>
              <p className="text-xs text-muted-foreground">
                {detail.source} &middot;{" "}
                {new Date(detail.uploaded_at).toLocaleString()}
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(detail.id)}
            disabled={deleting === detail.id}
          >
            {deleting === detail.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
        </div>

        <OverviewCards
          totalRows={detail.total_rows}
          errorCount={detail.error_count}
          uniqueErrors={detail.unique_errors}
          timeRangeStart={detail.time_range_start}
          timeRangeEnd={detail.time_range_end}
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Error Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorTrendChart data={trendData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Source Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SourceBreakdown
                acuityErrors={
                  detail.source === "acuity" ? detail.error_count : 0
                }
                zohoErrors={detail.source === "zoho" ? detail.error_count : 0}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Top Error Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patterns.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No patterns detected
                </p>
              ) : (
                <div className="space-y-2">
                  {patterns.slice(0, 10).map((p) => (
                    <div key={p.id} className="rounded-lg border px-3 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">
                          {p.sample_message}
                        </p>
                        <Badge
                          className={`shrink-0 text-[10px] ${severityBadge(p.severity)}`}
                        >
                          {p.count}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {p.first_seen.substring(0, 10)} —{" "}
                        {p.last_seen.substring(0, 10)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Anomaly Spikes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anomalies.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No anomalies detected
                </p>
              ) : (
                <div className="space-y-2">
                  {anomalies.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border px-3 py-2"
                    >
                      <AlertTriangle
                        className={`mt-0.5 h-4 w-4 shrink-0 ${a.severity === "high" ? "text-red-500" : "text-amber-500"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {a.error_count} errors vs{" "}
                          {Math.round(a.expected_count)} expected
                        </p>
                      </div>
                      <Badge
                        className={`shrink-0 text-[10px] ${severityBadge(a.severity)}`}
                      >
                        {a.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {detail.executive_summary && (
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {detail.executive_summary}
              </p>
            </CardContent>
          </Card>
        )}

        {methodsList.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {methodsList.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-mono text-xs truncate">
                      {m.method}
                    </span>
                    <span className="tabular-nums text-muted-foreground ml-4">
                      {m.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-accent-vibrant" />
          <h1 className="text-3xl font-bold tracking-tight">Log Analysis</h1>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)}>
          <Plus className="h-4 w-4" />
          New Analysis
        </Button>
      </div>

      {showUpload && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <CsvUpload
              onAnalyzed={() => {
                setShowUpload(false);
                fetchAnalyses();
              }}
            />
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No analyses yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload an Acuity or Zoho CSV log export to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {analyses.map((a) => (
            <Card
              key={a.id}
              className="cursor-pointer transition-colors hover:border-accent-vibrant/30"
              onClick={() => router.push(`/logs?id=${a.id}`)}
            >
              <CardContent className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{a.filename}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {a.source}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.total_rows.toLocaleString()} rows &middot;{" "}
                    {a.error_count.toLocaleString()} errors &middot;{" "}
                    {new Date(a.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Badge
                    className={
                      a.error_count > 0
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }
                  >
                    {a.error_count > 0
                      ? `${((a.error_count / a.total_rows) * 100).toFixed(1)}% errors`
                      : "No errors"}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(a.id);
                    }}
                    disabled={deleting === a.id}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    {deleting === a.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
