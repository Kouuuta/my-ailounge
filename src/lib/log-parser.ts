import { parse } from "csv-parse/sync";

const TIMESTAMP_KEYS = /^(created_at|timestamp|date|datetime|time)$/i;
const CONTENT_KEYS = /^(content|message|description|status|result)$/i;
const ACTION_KEYS = /^(action|type|operation|event)$/i;
const METHOD_KEYS = /^(method|function|endpoint|api)$/i;
const ERROR_CODE_KEYS = /^(error_code|status_code|code|error|http_status)$/i;
const RESPONSE_KEYS = /^(response|result|output|body)$/i;

const VARIABLE_PATTERNS = [
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
  /\b\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:[+-]\d{2}:\d{2}|Z)?/g,
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

  // 1. Standard JSON.parse (handles Zoho and other proper JSON responses)
  try {
    const parsed = JSON.parse(response);
    const code = parsed.code || parsed.status || parsed.status_code || "";
    const message = parsed.message || parsed.error || "";
    if (code && code !== "SUCCESS") return `${code}: ${message}`.trim();
    if (message && !SUCCESS_VALUES.has(message.toLowerCase())) return message;
    if (parsed.data && Array.isArray(parsed.data)) {
      for (const item of parsed.data) {
        if (item.code && item.code !== "SUCCESS") return `${item.code}: ${item.message || ""}`.trim();
      }
    }
    return null;
  } catch {}

  // 2. Python dict Format A: {'status_code': N, 'message': '...', 'error': '...'}
  //    Handles embedded double quotes and escaped single quotes in values
  const matchA = response.match(
    /'status_code':\s*(\d+),\s*'message':\s*'((?:[^'\\]|\\.)*)'(?:,\s*'error':\s*'(?:[^'\\]|\\.)*')?(?:,\s*'data':\s*\{[^}]*\})?\s*,?\s*\}/
  );
  if (matchA) {
    const [, code, rawMessage] = matchA;
    const decoded = rawMessage.replace(/\\'/g, "'");
    return `${code}: ${decoded}`;
  }

  // 3. Python dict Format B: {'error': '...'} (single key, sync_session style)
  //    May contain escaped quotes, embedded \n characters, and additional keys
  const matchB = response.match(
    /\{\s*'error':\s*'((?:[^'\\]|\\.)*)'(?:[\s\S]*?)\}/
  );
  if (matchB) {
    const raw = matchB[1];
    const cleaned = raw.replace(/\\'/g, "'");
    const firstLine = cleaned.split("\\n")[0];
    return firstLine;
  }

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

export function normalizeMessage(msg: string): string {
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

function categorizePattern(key: string): string {
  if (key.includes("not an available time slot") || key.includes("not far enough in advance")) return "booking-availability";
  if (key.includes("doctor") && (key.includes("appointment type") || key.includes("calendar"))) return "doctor-assignment";
  if (key.includes("email") && (key.includes("not found") || key.includes("does not exist"))) return "user-lookup";
  if (key.includes("both completed and cancelled were ticked")) return "conflicting-state";
  if (key.includes("api access is only available on")) return "permissions";
  if (key.includes("existing session cancelled")) return "session-conflict";
  return "other";
}

const CATEGORY_LABELS: Record<string, string> = {
  "booking-availability": "scheduling conflicts",
  "doctor-assignment": "doctor-calendar mismatches",
  "user-lookup": "user lookup failures",
  "conflicting-state": "conflicting appointment states",
  "permissions": "access permission errors",
  "session-conflict": "session conflicts",
  "other": "other errors",
};

export interface ParsedRow {
  is_error: boolean;
  method: string;
  action: string;
  content: string;
  error_type: string;
  pattern_key: string;
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
    const patternKey = normalizeMessage(actualErrorType);

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
      pattern_key: patternKey,
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

  const categoryCounts = new Map<string, number>();
  for (const p of patterns) {
    const cat = categorizePattern(p.pattern_key);
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + p.count);
  }
  const sortedCats = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);

  const methodErrorFreq = new Map<string, number>();
  for (const err of errors) {
    if (err.method) methodErrorFreq.set(err.method, (methodErrorFreq.get(err.method) || 0) + 1);
  }
  const topMethod = [...methodErrorFreq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  let summary = "";
  if (errorCount === 0) {
    summary = `No errors detected across ${totalRows.toLocaleString()} log entries from ${source === "acuity" ? "Acuity" : "Zoho"}. The service is operating normally.`;
  } else {
    const topCat = sortedCats[0];
    const topLabel = CATEGORY_LABELS[topCat[0]] || topCat[0];
    const topPct = Math.round((topCat[1] / errorCount) * 100);

    summary = `The primary issue involves ${topLabel}, accounting for approximately ${topPct}% of errors.`;

    if (sortedCats.length > 1) {
      const secondCat = sortedCats[1];
      const secondLabel = CATEGORY_LABELS[secondCat[0]] || secondCat[0];
      const secondPct = Math.round((secondCat[1] / errorCount) * 100);
      if (secondPct >= 5) {
        summary += ` ${secondLabel} contribute another ${secondPct}%.`;
      }
    }

    if (anomalies.length > 0) {
      const spikeDays = anomalies.length;
      summary += ` Error volumes spiked on ${spikeDays} day${spikeDays > 1 ? "s" : ""}, reaching several times the typical daily baseline.`;
    } else {
      summary += ` Daily error volumes remained consistent throughout the observed period.`;
    }

    if (topMethod) summary += ` Most errors originate from ${topMethod}.`;

    summary += ` Recommended investigation: review the conditions driving ${topLabel} and inspect the spike periods for correlated changes.`;
  }

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
