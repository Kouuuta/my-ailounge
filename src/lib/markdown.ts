import fs from "fs";
import path from "path";

const FEEDS_DIR = path.join(process.cwd(), "docs", "feeds");
const MAX_FEED_LINES = 500;

function trimFeedFile(filePath: string): void {
  const content = fs.readFileSync(filePath, "utf-8");
  let lines = content.split("\n");

  if (lines.length <= MAX_FEED_LINES) return;

  // Strip trailing empty lines first so we count only meaningful lines
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  if (lines.length <= MAX_FEED_LINES) {
    fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
    return;
  }

  const excess = lines.length - MAX_FEED_LINES;
  const removeIndices = new Set<number>();

  // Walk from bottom up, removing oldest item lines first
  for (let i = lines.length - 1; i >= 0 && removeIndices.size < excess; i--) {
    if (lines[i].startsWith("- [")) {
      removeIndices.add(i);
    }
  }

  lines = lines.filter((_, i) => !removeIndices.has(i));

  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
  console.log(`  ✂️  Trimmed ${filePath} to ${MAX_FEED_LINES} lines (removed ${removeIndices.size} oldest entries)`);
}

export function appendToFeed(filename: string, title: string, url: string, publishedAt: string, tags: string): void {
  const filePath = path.join(FEEDS_DIR, filename);

  if (!fs.existsSync(FEEDS_DIR)) {
    fs.mkdirSync(FEEDS_DIR, { recursive: true });
  }

  const monthHeader = getMonthHeader(publishedAt);
  const newLine = `- [${title}](${url}) | ${publishedAt} | ${tags}\n`;

  if (!fs.existsSync(filePath)) {
    const content = `# ${path.basename(filename, ".md").replace(/^\d+-/, "").replace(/-/g, " ")}\n\n${monthHeader}\n${newLine}`;
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  📝 Created ${filename}`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");

  if (content.includes(`${newLine.trim()}`)) {
    console.log(`  ⏭️  Duplicate, skipping: ${title.substring(0, 60)}`);
    return;
  }

  if (content.includes(monthHeader)) {
    const lines = content.split("\n");
    let insertIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === monthHeader.trim()) {
        insertIdx = i + 1;
        break;
      }
    }
    if (insertIdx >= 0) {
      lines.splice(insertIdx + 1, 0, newLine.trim());
      fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
    } else {
      fs.appendFileSync(filePath, `\n${newLine}`, "utf-8");
    }
  } else {
    fs.appendFileSync(filePath, `\n${monthHeader}\n${newLine}`, "utf-8");
  }

  console.log(`  📝 Appended to ${filename}: ${title.substring(0, 60)}`);

  trimFeedFile(filePath);
}

function getMonthHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `## ${months[d.getMonth()]} ${d.getFullYear()}`;
}
