import { parse } from "csv-parse/sync";

const TIMESTAMP_KEYS = /^(created_at|timestamp|date|datetime|time)$/i;
const CONTENT_KEYS = /^(content|message|description|status|result)$/i;
const ACTION_KEYS = /^(action|type|operation|event)$/i;
const METHOD_KEYS = /^(method|function|endpoint|api)$/i;
const ERROR_CODE_KEYS = /^(error_code|status_code|code|error|http_status)$/i;
const RESPONSE_KEYS = /^(response|result|output|body)$/i;

const VARIABLE_PATTERNS = [
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
  /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g,
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
  /\b\+?\d[\d\s\-().]{7,}\d\b/g,
  /\b\d{6,}\b/g,
  /'[^']+'/g,
  /"[^"]+"/g,
];

const SUCCESS_VALUES = new Set(["success", "ok", "true", "200", "201", "204"]);

interface ColumnMap {
  timestamp: string | null;
  content: string | null;
  action: string | null;
  method: string | null;
  error_code: string | null;
  response: string | null;
}

function detectColumns(headers: string[]): ColumnMap {
  const map: ColumnMap = { timestamp: null, content: null, action: null, method: null, error_code: null, response: null };
  for (const h of headers) {
    const hh = h.trim();
    if (TIMESTAMP_KEYS.test(hh)) map.timestamp = h;
    else if (CONTENT_KEYS.test(hh)) map.content = h;
    else if (ACTION_KEYS.test(hh)) map.action = h;
    else if (METHOD_KEYS.test(hh)) map.method = h;
    else if (ERROR_CODE_KEYS.test(hh)) map.error_code = h;
    else if (RESPONSE_KEYS.test(hh)) map.response = h;
  }
  return map;
}

function isSuccess(content: string | null, errorCode: string | null): boolean {
  if (content && SUCCESS_VALUES.has(content.trim().toLowerCase())) return true;
  if (errorCode && SUCCESS_VALUES.has(errorCode.trim())) return true;
  return false;
}

function extractResponseError(response: string | null): string | null {
  if (!response) return null;
  try {
    const parsed = JSON.parse(response);
    const code = parsed.code || parsed.status || "";
    const message = parsed.message || parsed.error || "";
    if (code && code !== "SUCCESS") return `${code}: ${message}`.trim();
    if (message && !SUCCESS_VALUES.has(message.toLowerCase())) return message;
    if (parsed.data && Array.isArray(parsed.data)) {
      for (const item of parsed.data) {
        if (item.code && item.code !== "SUCCESS") return `${item.code}: ${item.message || ""}`.trim();
      }
    }
  } catch { }
  return null;
}

function parseResponseJson(response: string | null): string | null {
  if (!response) return null;
  try {
    const parsed = JSON.parse(response);
    return JSON.stringify(parsed);
  } catch {
    return response.substring(0, 500);
  }
}

function normalizeMessage(msg: string): string {
  let normalized = msg;
  for (const pattern of VARIABLE_PATTERNS) {
    normalized = normalized.replace(pattern, "{var}");
  }
  return normalized.replace(/\s+/g, " ").trim().toLowerCase();
}

function classifySeverity(count: number, total: number): string {
  const ratio = count / total;
  if (ratio > 0.05) return "high";
  if (ratio > 0.01) return "medium";
  return "low";
}

export interface ParsedRow {
  is_error: boolean;
  method: string;
  action: string;
  content: string;
  error_type: string;
  error_code: string;
  raw_message: string;
  timestamp: string;
}

export interface AnalysisResult {
  analysis: {
    total_rows: number;
    error_count: number;
    unique_errors: number;
    time_range_start: string;
    time_range_end: string;
    methods: string;
    executive_summary: string;
  };
  errors: ParsedRow[];
  patterns: {
    pattern_key: string;
    sample_message: string;
    count: number;
    first_seen: string;
    last_seen: string;
    severity: string;
  }[];
  anomalies: {
    description: string;
    severity: string;
    detected_at: string;
    error_count: number;
    expected_count: number;
    deviation: number;
  }[];
}

export function parseLogCsv(csvText: string, filename: string): AnalysisResult {
  const rawRows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  if (rawRows.length === 0) {
    throw new Error("CSV is empty");
  }

  const headers = Object.keys(rawRows[0]);
  const cols = detectColumns(headers);
  const source = filename.toLowerCase().startsWith("acuity") ? "acuity" : "zoho";

  const parsedRows: ParsedRow[] = [];
  let minTs = "";
  let maxTs = "";

  for (const row of rawRows) {
    const content = cols.content ? (row[cols.content] || "").trim() : "";
    const errorCode = cols.error_code ? (row[cols.error_code] || "").trim() : "";
    const response = cols.response ? (row[cols.response] || "").trim() : null;
    const method = cols.method ? (row[cols.method] || "").trim() : "";
    const action = cols.action ? (row[cols.action] || "").trim() : "";
    const timestamp = cols.timestamp ? (row[cols.timestamp] || "").trim() : "";

    const responseError = extractResponseError(response);
    const responseRaw = parseResponseJson(response);
    const rawMessage = responseError || responseRaw || content || errorCode || "";

    const isSuccessRow = isSuccess(content, errorCode);
    const actualErrorType = isSuccessRow ? "success" : (responseError || content || errorCode || "unknown");

    if (timestamp) {
      if (!minTs || timestamp < minTs) minTs = timestamp;
      if (!maxTs || timestamp > maxTs) maxTs = timestamp;
    }

    parsedRows.push({
      is_error: !isSuccessRow,
      method,
      action,
      content,
      error_type: actualErrorType,
      error_code: errorCode,
      raw_message: rawMessage,
      timestamp,
    });
  }

  const errors = parsedRows.filter((r) => r.is_error);
  const totalRows = parsedRows.length;
  const errorCount = errors.length;

  const errorGroup = new Map<string, { messages: string[]; timestamps: string[] }>();
  for (const err of errors) {
    const key = normalizeMessage(err.error_type);
    if (!errorGroup.has(key)) errorGroup.set(key, { messages: [], timestamps: [] });
    const group = errorGroup.get(key)!;
    if (!group.messages.includes(err.error_type)) group.messages.push(err.error_type);
    if (err.timestamp) group.timestamps.push(err.timestamp);
  }

  const patterns = [...errorGroup.entries()]
    .map(([key, val]) => ({
      pattern_key: key,
      sample_message: val.messages[0],
      count: val.timestamps.length,
      first_seen: val.timestamps.sort()[0] || "",
      last_seen: val.timestamps.sort().reverse()[0] || "",
      severity: classifySeverity(val.timestamps.length, errorCount),
    }))
    .sort((a, b) => b.count - a.count);

  const errorBuckets = new Map<string, number>();
  for (const err of errors) {
    if (err.timestamp) {
      const day = err.timestamp.substring(0, 10);
      errorBuckets.set(day, (errorBuckets.get(day) || 0) + 1);
    }
  }

  const dailyCounts = [...errorBuckets.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const mean = dailyCounts.length > 0 ? dailyCounts.reduce((s, [, c]) => s + c, 0) / dailyCounts.length : 0;
  const variance = dailyCounts.length > 0
    ? dailyCounts.reduce((s, [, c]) => s + (c - mean) ** 2, 0) / dailyCounts.length
    : 0;
  const stddev = Math.sqrt(variance);

  const anomalies = dailyCounts
    .filter(([, count]) => count > mean + 2 * stddev && stddev > 0)
    .map(([day, count]) => ({
      description: `Error spike on ${day}: ${count} errors (${(count / mean).toFixed(1)}x baseline of ${Math.round(mean)})`,
      severity: count > mean + 3 * stddev ? "high" : "medium",
      detected_at: day,
      error_count: count,
      expected_count: Math.round(mean),
      deviation: (count - mean) / (stddev || 1),
    }));

  const methodFreq = new Map<string, number>();
  for (const row of parsedRows) {
    if (row.method) methodFreq.set(row.method, (methodFreq.get(row.method) || 0) + 1);
  }

  const topErrors = patterns.slice(0, 5).map((p) => p.sample_message.substring(0, 80)).join("; ") || "none";
  const summary = `Analyzed ${totalRows.toLocaleString()} log entries from ${source === "acuity" ? "Acuity" : "Zoho"}. Found ${errorCount.toLocaleString()} errors (${(errorCount / totalRows * 100).toFixed(1)}% rate). Top error patterns: ${topErrors}. ${anomalies.length} anomaly spike${anomalies.length !== 1 ? "s" : ""} detected.`;

  return {
    analysis: {
      total_rows: totalRows,
      error_count: errorCount,
      unique_errors: patterns.length,
      time_range_start: minTs,
      time_range_end: maxTs,
      methods: JSON.stringify([...methodFreq.entries()].map(([k, v]) => ({ method: k, count: v }))),
      executive_summary: summary,
    },
    errors: parsedRows,
    patterns,
    anomalies,
  };
}
