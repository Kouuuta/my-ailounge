import { cn } from "@/lib/utils";

export const CATEGORIES = [
  { value: "", label: "All Categories", color: "" },
  { value: "code_review", label: "Code Review", color: "bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30" },
  { value: "debugging", label: "Debugging", color: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  { value: "architecture", label: "Architecture", color: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30" },
  { value: "incident_analysis", label: "Incident Analysis", color: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30" },
  { value: "refactoring", label: "Refactoring", color: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  { value: "security_audit", label: "Security Audit", color: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30" },
  { value: "documentation", label: "Documentation", color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30" },
  { value: "intern_mentoring", label: "Intern Mentoring", color: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { value: "stakeholder_emails", label: "Stakeholder Emails", color: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" },
];

export const SOURCES = [
  { value: "", label: "All Sources" },
  { value: "curated", label: "Curated" },
  { value: "community", label: "Community" },
  { value: "ui_design", label: "UI Design" },
];

export const SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  SOURCES.filter((s) => s.value).map((s) => [s.value, s.label]),
);

export function CategoryFilter({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 border",
              isActive
                ? cat.color || "bg-accent text-accent-foreground border-border"
                : "bg-card text-muted-foreground border-border hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

export function SourceFilter({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SOURCES.map((src) => {
        const isActive = selected === src.value;
        return (
          <button
            key={src.value}
            onClick={() => onChange(src.value)}
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 border",
              isActive
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {src.label}
          </button>
        );
      })}
    </div>
  );
}

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.filter((c) => c.value).map((c) => [c.value, c.label]),
);
