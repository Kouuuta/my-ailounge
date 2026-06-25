import { cn } from "@/lib/utils";
import { MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PromptItem {
  id: number;
  title: string;
  content: string;
  category: string;
  description: string | null;
  usage_count: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  code_review: "Code Review",
  debugging: "Debugging",
  architecture: "Architecture",
  incident_analysis: "Incident Analysis",
  refactoring: "Refactoring",
  security_audit: "Security Audit",
  documentation: "Documentation",
  intern_mentoring: "Intern Mentoring",
  stakeholder_emails: "Stakeholder Emails",
};

const CATEGORY_COLORS: Record<string, string> = {
  code_review: "text-teal-600 dark:text-teal-400 bg-teal-500/10",
  debugging: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
  architecture: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  incident_analysis: "text-red-600 dark:text-red-400 bg-red-500/10",
  refactoring: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  security_audit: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
  documentation: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10",
  intern_mentoring: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  stakeholder_emails: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
};

export function FeaturedPrompt({
  item,
  delay = 0,
}: {
  item: PromptItem | null;
  delay?: number;
}) {
  if (!item) return null;

  return (
    <div
      className="animate-slide-up rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:shadow-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20">
            <MessageSquare className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground font-display tracking-wide">
            Featured Prompt
          </h3>
        </div>
        <Link href="/prompts" className="group block">
          <div className="rounded-xl bg-accent/50 border border-border/50 px-3 py-2.5 transition-all duration-200 hover:bg-accent">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-accent-vibrant transition-colors truncate">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium mt-2",
                    CATEGORY_COLORS[item.category] ?? "bg-accent/50 text-muted-foreground",
                  )}
                >
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-accent-vibrant transition-colors" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
