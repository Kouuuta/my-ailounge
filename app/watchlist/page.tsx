"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  X,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Wrench,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type WatchItem = {
  id: number;
  name: string;
  category: string | null;
  installed_version: string | null;
  latest_version: string | null;
  risk_level: string;
  upgrade_notes: string | null;
  known_vulns: string | null;
  migration_link: string | null;
  updated_at: string;
};

const CATEGORIES = [
  "framework",
  "database",
  "infra",
  "cloud",
  "ai-sdk",
  "tool",
];

const RISK_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; bg: string; text: string }
> = {
  low: {
    icon: ShieldCheck,
    label: "Low",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  medium: {
    icon: ShieldAlert,
    label: "Medium",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  high: {
    icon: ShieldX,
    label: "High",
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const dynamic = "force-dynamic";

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [addName, setAddName] = useState("");
  const [addCategory, setAddCategory] = useState("framework");
  const [addRisk, setAddRisk] = useState("low");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/watchlist");
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateField = async (
    id: number,
    field: string,
    value: string | number,
  ) => {
    const res = await fetch(`/api/watchlist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? data.item : i)));
    }
  };

  const deleteItem = async (id: number) => {
    setDeletingId(id);
    const res = await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  };

  const addItem = async () => {
    if (!addName.trim()) return;
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addName,
        category: addCategory,
        risk_level: addRisk,
      }),
    });
    if (res.ok) {
      setAddName("");
      setAddCategory("framework");
      setAddRisk("low");
      setShowAddForm(false);
      fetchItems();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to add item");
    }
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...items].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[sortField];
    const bVal = (b as Record<string, unknown>)[sortField];
    const cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const counts = { high: 0, medium: 0, low: 0 };
  for (const item of items) {
    if (item.risk_level in counts) {
      counts[item.risk_level as keyof typeof counts]++;
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 ml-0.5 inline" />
    ) : (
      <ChevronDown className="h-3 w-3 ml-0.5 inline" />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="animate-fade-in flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-accent-vibrant" />
              <h1 className="text-3xl font-bold tracking-tight">
                Stack Watchlist
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Track versions and risks across your real stack
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {showAddForm ? "Cancel" : "Add Item"}
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6 border-primary/30 animate-slide-down">
            <CardContent className="pt-6">
              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Name
                  </label>
                  <Input
                    placeholder="e.g. Tailwind CSS"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Category
                  </label>
                  <Select value={addCategory} onValueChange={setAddCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Risk Level
                  </label>
                  <Select value={addRisk} onValueChange={setAddRisk}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addItem} className="w-full">
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="mb-4 px-4 py-2 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <Card className="animate-fade-in">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-muted rounded animate-pulse"
                    style={{ animationDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No items tracked yet.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add your first item
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none w-[180px]"
                      onClick={() => toggleSort("name")}
                    >
                      Name <SortIcon field="name" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none w-[100px]"
                      onClick={() => toggleSort("category")}
                    >
                      Category <SortIcon field="category" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none w-[110px]"
                      onClick={() => toggleSort("installed_version")}
                    >
                      Installed <SortIcon field="installed_version" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none w-[110px]"
                      onClick={() => toggleSort("latest_version")}
                    >
                      Latest <SortIcon field="latest_version" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none w-[90px]"
                      onClick={() => toggleSort("risk_level")}
                    >
                      Risk <SortIcon field="risk_level" />
                    </TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead
                      className="cursor-pointer select-none w-[80px]"
                      onClick={() => toggleSort("updated_at")}
                    >
                      Updated <SortIcon field="updated_at" />
                    </TableHead>
                    <TableHead className="w-[40px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((item, index) => {
                    const risk =
                      RISK_CONFIG[item.risk_level] || RISK_CONFIG.low;
                    const RiskIcon = risk.icon;
                    return (
                      <TableRow
                        key={item.id}
                        className={cn(
                          "animate-slide-up",
                          deletingId === item.id &&
                            "opacity-0 transition-opacity duration-200",
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <EditableCell
                            value={item.installed_version}
                            onSave={(v) =>
                              updateField(item.id, "installed_version", v)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <EditableCell
                            value={item.latest_version}
                            onSave={(v) =>
                              updateField(item.id, "latest_version", v)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.risk_level}
                            onValueChange={(v) =>
                              updateField(item.id, "risk_level", v)
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                "h-7 text-xs gap-1 px-2 py-0 border-0",
                                risk.bg,
                                risk.text,
                              )}
                            >
                              <RiskIcon className="h-3 w-3" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low" className="text-xs">
                                <span className="flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3 text-emerald-500" />{" "}
                                  Low
                                </span>
                              </SelectItem>
                              <SelectItem value="medium" className="text-xs">
                                <span className="flex items-center gap-1">
                                  <ShieldAlert className="h-3 w-3 text-amber-500" />{" "}
                                  Medium
                                </span>
                              </SelectItem>
                              <SelectItem value="high" className="text-xs">
                                <span className="flex items-center gap-1">
                                  <ShieldX className="h-3 w-3 text-rose-500" />{" "}
                                  High
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <EditableCell
                            value={item.upgrade_notes}
                            onSave={(v) =>
                              updateField(item.id, "upgrade_notes", v)
                            }
                            placeholder="Add note..."
                          />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(item.updated_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Remove "${item.name}" from watchlist?`,
                                )
                              ) {
                                deleteItem(item.id);
                              }
                            }}
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {items.length > 0 && (
          <div className="animate-fade-in mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{items.length} total</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              {counts.high} high
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {counts.medium} medium
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {counts.low} low
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function EditableCell({
  value,
  onSave,
  placeholder,
}: {
  value: string | null;
  onSave: (v: string) => void;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  if (editing) {
    return (
      <Input
        className="h-7 text-xs px-1.5"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== (value ?? "")) onSave(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === "Escape") {
            setDraft(value ?? "");
            setEditing(false);
          }
        }}
        autoFocus
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      className="h-7 w-full text-left text-sm px-1.5 rounded hover:bg-muted/60 transition-colors cursor-pointer truncate max-w-[120px]"
      onClick={() => {
        setDraft(value ?? "");
        setEditing(true);
      }}
      title={value ?? placeholder ?? "Click to edit"}
    >
      {value || (
        <span className="text-muted-foreground/50 italic">
          {placeholder || "—"}
        </span>
      )}
    </button>
  );
}
