import fs from "fs";
import path from "path";

const FEEDS_DIR = path.join(process.cwd(), "docs", "feeds");

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
}

function getMonthHeader(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `## ${months[d.getMonth()]} ${d.getFullYear()}`;
}
