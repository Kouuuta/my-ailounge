"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Rss,
  Layers,
  ScrollText,
  Radio,
  MessageSquare,
  BookOpen,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const NAV_ITEMS = [
  { href: "/", label: "Briefing", icon: LayoutDashboard },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/watchlist", label: "Stack", icon: Layers },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/intern-tasks", label: "Tasks", icon: BookOpen },
  { href: "/repo-radar", label: "Radar", icon: Radio },
  { href: "/prompts", label: "Prompts", icon: MessageSquare },
];

function SidebarStats() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lastIngest: null as string | null,
    itemsToday: 0,
    itemsThisWeek: 0,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div className="px-4 py-4 border-t border-border">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
        Quick Stats
      </p>
      <div className="space-y-2">
        <StatRow label="Total Items" value={String(stats.totalItems || "—")} />
        <StatRow
          label="Last Ingest"
          value={stats.lastIngest ? timeAgo(stats.lastIngest) : "—"}
        />
        <StatRow label="Today" value={`${stats.itemsToday || "—"} items`} />
        <StatRow
          label="This Week"
          value={`${stats.itemsThisWeek || "—"} items`}
        />
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-mono text-foreground/80 font-medium">
        {value}
      </span>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
        active
          ? "bg-accent text-accent-foreground border border-border shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <aside className="fixed top-0 left-0 z-40 w-60 h-screen bg-background border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold font-display">M</span>
          </div>
          <span className="text-foreground font-semibold text-sm tracking-wide font-display">
            my-ailounge
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
          Developer Intelligence
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 mb-2">
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-150"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>

      {/* Quick Stats */}
      <SidebarStats />
    </aside>
  );
}
