import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";
import { parseLogCsv } from "@/src/lib/log-parser";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM log_analyses ORDER BY uploaded_at DESC")
    .all() as Record<string, unknown>[];
  return NextResponse.json({ analyses: rows });
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "Only CSV files are accepted" }, { status: 400 });
  }

  const csvText = await file.text();

  let result;
  try {
    result = parseLogCsv(csvText, file.name);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to parse CSV";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const source = file.name.toLowerCase().startsWith("acuity") ? "acuity" : "zoho";

  const insertAnalysis = db.prepare(`
    INSERT INTO log_analyses
      (filename, source, total_rows, error_count, unique_errors, time_range_start, time_range_end, methods, executive_summary)
    VALUES
      (@filename, @source, @total_rows, @error_count, @unique_errors, @time_range_start, @time_range_end, @methods, @executive_summary)
  `);

  const insertError = db.prepare(`
    INSERT INTO log_errors
      (analysis_id, source, method, action, content, error_type, error_code, raw_message, timestamp, is_error)
    VALUES
      (@analysis_id, @source, @method, @action, @content, @error_type, @error_code, @raw_message, @timestamp, @is_error)
  `);

  const insertPattern = db.prepare(`
    INSERT INTO log_patterns
      (analysis_id, source, pattern_key, sample_message, count, first_seen, last_seen, severity)
    VALUES
      (@analysis_id, @source, @pattern_key, @sample_message, @count, @first_seen, @last_seen, @severity)
  `);

  const insertAnomaly = db.prepare(`
    INSERT INTO log_anomalies
      (analysis_id, source, description, severity, detected_at, error_count, expected_count, deviation)
    VALUES
      (@analysis_id, @source, @description, @severity, @detected_at, @error_count, @expected_count, @deviation)
  `);

  const analysisResult = insertAnalysis.run({
    filename: file.name,
    source,
    total_rows: result.analysis.total_rows,
    error_count: result.analysis.error_count,
    unique_errors: result.analysis.unique_errors,
    time_range_start: result.analysis.time_range_start,
    time_range_end: result.analysis.time_range_end,
    methods: result.analysis.methods,
    executive_summary: result.analysis.executive_summary,
  });

  const analysisId = Number(analysisResult.lastInsertRowid);

  for (const err of result.errors) {
    insertError.run({
      analysis_id: analysisId,
      source,
      method: err.method,
      action: err.action,
      content: err.content,
      error_type: err.error_type.substring(0, 500),
      error_code: err.error_code,
      raw_message: err.raw_message.substring(0, 1000),
      timestamp: err.timestamp,
      is_error: err.is_error ? 1 : 0,
    });
  }

  for (const pat of result.patterns) {
    insertPattern.run({
      analysis_id: analysisId,
      source,
      pattern_key: pat.pattern_key,
      sample_message: pat.sample_message.substring(0, 500),
      count: pat.count,
      first_seen: pat.first_seen,
      last_seen: pat.last_seen,
      severity: pat.severity,
    });
  }

  for (const anom of result.anomalies) {
    insertAnomaly.run({
      analysis_id: analysisId,
      source,
      description: anom.description,
      severity: anom.severity,
      detected_at: anom.detected_at,
      error_count: anom.error_count,
      expected_count: anom.expected_count,
      deviation: anom.deviation,
    });
  }

  return NextResponse.json({ id: analysisId, source, ...result.analysis }, { status: 201 });
}
