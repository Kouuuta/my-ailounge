"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Target, FlaskConical, FileOutput, Bookmark } from "lucide-react";
import type { InternTask } from "@/src/config/intern-tasks";

interface InternTaskCardProps {
  task: InternTask;
  index: number;
  categoryColor: string;
  difficultyColor: string;
}

export function InternTaskCard({
  task,
  index,
  categoryColor,
  difficultyColor,
}: InternTaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const categoryLabel = {
    "synthetic-data": "Synthetic Data",
    "mock-apis": "Mock APIs",
    "local-db": "Local DB",
    "code-review": "Code Review",
    "docs-research": "Docs & Research",
    "git-workflow": "Git Workflow",
  }[task.category];

  return (
    <div
      className={cn(
        "animate-slide-up rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:shadow-lg",
        expanded && "shadow-md",
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium font-mono border",
              categoryColor,
            )}
          >
            {categoryLabel}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py.0.5 text-[10px] font-medium font-mono border",
              difficultyColor,
            )}
          >
            {task.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground mb-1.5 leading-snug">
          {task.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {task.description}
        </p>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium transition-colors",
            expanded
              ? "text-accent-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Less details
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              More details
            </>
          )}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-fade-in">
            <DetailRow
              icon={Target}
              label="Learning Objective"
              text={task.learningObjective}
            />
            <DetailRow
              icon={FlaskConical}
              label="Safe Environment"
              text={task.safeEnvironment}
            />
            <DetailRow
              icon={FileOutput}
              label="Expected Output"
              text={task.expectedOutput}
            />
            {task.resources.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[11px] font-medium text-muted-foreground font-mono uppercase tracking-wider">
                    Resources
                  </span>
                </div>
                <ul className="space-y-1">
                  {task.resources.map((r) => (
                    <li
                      key={r}
                      className="text-xs text-muted-foreground/80 pl-5 relative before:absolute before:left-2 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/30"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  text,
}: {
  icon: React.ElementType;
  label: string;
  text: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-[11px] font-medium text-muted-foreground font-mono uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed pl-5">{text}</p>
    </div>
  );
}
