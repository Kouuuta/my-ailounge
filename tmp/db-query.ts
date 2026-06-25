import { getDb } from '../src/db/client';
const db = getDb();

console.log('=== ANALYSIS ===');
const a = db.prepare('SELECT id, filename, source, total_rows, error_count, unique_errors, time_range_start, time_range_end, executive_summary, methods FROM log_analyses ORDER BY id').all();
console.log(JSON.stringify(a, null, 2));

console.log('=== ERROR ROWS COUNT ===');
const e = db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN is_error=1 THEN 1 ELSE 0 END) as errors, SUM(CASE WHEN is_error=0 THEN 1 ELSE 0 END) as successes FROM log_errors WHERE analysis_id = 8').all();
console.log(JSON.stringify(e, null, 2));

console.log('=== PATTERNS (analysis 8) ===');
const p = db.prepare('SELECT pattern_key, count, severity FROM log_patterns WHERE analysis_id = 8 ORDER BY count DESC').all();
console.log(JSON.stringify(p, null, 2));

console.log('=== ANOMALIES (analysis 8) ===');
const an = db.prepare('SELECT detected_at, error_count, expected_count, deviation, severity FROM log_anomalies WHERE analysis_id = 8 ORDER BY detected_at').all();
console.log(JSON.stringify(an, null, 2));

console.log('=== METHODS (analysis 8) ===');
const m = db.prepare('SELECT method, COUNT(*) as cnt FROM log_errors WHERE analysis_id = 8 GROUP BY method ORDER BY cnt DESC').all();
console.log(JSON.stringify(m, null, 2));

console.log('=== DISTINCT ERROR_TYPES (analysis 8) ===');
const et = db.prepare('SELECT error_type, COUNT(*) as cnt FROM log_errors WHERE analysis_id = 8 AND is_error = 1 GROUP BY error_type ORDER BY cnt DESC').all();
console.log(JSON.stringify(et, null, 2));

console.log('=== DAILY COUNTS (analysis 8, first 10) ===');
const dc = db.prepare("SELECT substr(timestamp,1,10) as day, COUNT(*) as cnt FROM log_errors WHERE analysis_id = 8 AND is_error = 1 GROUP BY day ORDER BY day LIMIT 10").all();
console.log(JSON.stringify(dc, null, 2));

console.log('=== DAILY COUNTS (analysis 8, last 10) ===');
const dc2 = db.prepare("SELECT substr(timestamp,1,10) as day, COUNT(*) as cnt FROM log_errors WHERE analysis_id = 8 AND is_error = 1 GROUP BY day ORDER BY day DESC LIMIT 10").all();
const dc2rev = [...dc2].reverse();
console.log(JSON.stringify(dc2rev, null, 2));

console.log('=== TOTAL DISTINCT DAYS (analysis 8) ===');
const nd = db.prepare("SELECT COUNT(DISTINCT substr(timestamp,1,10)) as days FROM log_errors WHERE analysis_id = 8 AND is_error = 1 AND timestamp != ''").all();
console.log(JSON.stringify(nd, null, 2));

// confidentiality check: check for raw emails/phones in stored fields
console.log('=== EMAIL IN ERROR_TYPE (analysis 8, sample 5) ===');
const emailCheck = db.prepare("SELECT error_type FROM log_errors WHERE analysis_id = 8 AND error_type LIKE '%@%' LIMIT 5").all();
console.log(JSON.stringify(emailCheck, null, 2));

console.log('=== EMAIL IN SAMPLE_MESSAGE (analysis 8, sample 5) ===');
const emailCheck2 = db.prepare("SELECT sample_message FROM log_patterns WHERE analysis_id = 8 AND sample_message LIKE '%@%' LIMIT 5").all();
console.log(JSON.stringify(emailCheck2, null, 2));

console.log('=== PHONE IN ERROR_TYPE (analysis 8) ===');
const phoneCheck = db.prepare("SELECT error_type FROM log_errors WHERE analysis_id = 8 AND error_type GLOB '*+*[0-9]*' AND error_type NOT GLOB '400:*' AND error_type NOT GLOB '403:*' LIMIT 5").all();
console.log(JSON.stringify(phoneCheck, null, 2));

console.log('=== RAW_MESSAGE CONTAINS EMAIL (analysis 8, sample 3) ===');
const rawEmail = db.prepare("SELECT raw_message FROM log_errors WHERE analysis_id = 8 AND raw_message LIKE '%@%' LIMIT 3").all();
console.log(JSON.stringify(rawEmail, null, 2));

db.close();
