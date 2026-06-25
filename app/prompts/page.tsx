"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CategoryFilter,
  SourceFilter,
  CATEGORIES,
} from "@/components/prompts/category-filter";
import { PromptCard } from "@/components/prompts/prompt-card";

interface PromptItem {
  id: number;
  title: string;
  content: string;
  category: string;
  description: string | null;
  input_fields: string | null;
  output_description: string | null;
  model_recommendation: string | null;
  source: string;
  source_url: string | null;
  usage_count: number;
  is_featured: number;
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-1.5">
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="flex justify-between pt-3 border-t">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

function AddPromptForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    description: "",
    input_fields: "",
    output_description: "",
    model_recommendation: "",
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.content.trim()) errs.content = "Content is required";
    if (!form.category) errs.category = "Category is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
      };
      if (form.description.trim()) body.description = form.description.trim();
      if (form.input_fields.trim())
        body.input_fields = form.input_fields.trim();
      if (form.output_description.trim())
        body.output_description = form.output_description.trim();
      if (form.model_recommendation.trim())
        body.model_recommendation = form.model_recommendation.trim();
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Prompt added");
      setForm({
        title: "",
        content: "",
        category: "",
        description: "",
        input_fields: "",
        output_description: "",
        model_recommendation: "",
      });
      setErrors({});
      setOpen(false);
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add prompt");
    } finally {
      setSubmitting(false);
    }
  };

  const set =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field])
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
    };

  return (
    <div className="mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5"
      >
        <Plus className="h-4 w-4" />
        {open ? "Cancel" : "Add Prompt"}
      </Button>
      {open && (
        <div className="mt-4 rounded-xl border bg-card p-5 space-y-4 animate-slide-up">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Title *
              </label>
              <Input
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Code Review Checklist"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-destructive">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Category *
              </label>
              <select
                value={form.category}
                onChange={set("category")}
                className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a category</option>
                {CATEGORIES.filter((c) => c.value).map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.category}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Content *
              </label>
              <textarea
                value={form.content}
                onChange={set("content")}
                placeholder="Paste the full prompt text here..."
                rows={4}
                className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              />
              {errors.content && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.content}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Input
                value={form.description}
                onChange={set("description")}
                placeholder="Brief description of use case"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Input Fields
              </label>
              <Input
                value={form.input_fields}
                onChange={set("input_fields")}
                placeholder="Comma-separated, e.g. code, language"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Output Description
              </label>
              <Input
                value={form.output_description}
                onChange={set("output_description")}
                placeholder="e.g. Returns rewritten code"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Model Recommendation
              </label>
              <Input
                value={form.model_recommendation}
                onChange={set("model_recommendation")}
                placeholder="e.g. Claude 4 Sonnet"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Adding..." : "Add Prompt"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const SOURCE_META: Record<string, { label: string; subtitle: string }> = {
  "": { label: "All", subtitle: "every source" },
  curated: { label: "Curated", subtitle: "hand-picked by the team" },
  community: {
    label: "Community",
    subtitle: "open-prompt-library (200+ prompts)",
  },
  ui_design: { label: "UI Design", subtitle: "design & UI generation prompts" },
};

export default function PromptsPage() {
  const [items, setItems] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (source) params.set("source", source);
      if (search) params.set("search", search);
      const res = await fetch(`/api/prompts?${params.toString()}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      console.error("Failed to fetch prompts:", err);
    } finally {
      setLoading(false);
    }
  }, [category, source, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = () => {
    setSearch(searchInput);
    setLoading(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setLoading(true);
  };

  const handleSourceChange = (value: string) => {
    setSource(value);
    setLoading(true);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setLoading(true);
  };

  const clearAllFilters = () => {
    setCategory("");
    setSource("");
    setSearch("");
    setSearchInput("");
    setLoading(true);
  };

  const hasAnyFilter = category || source || search;

  const handleCopy = async (id: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
    fetch(`/api/prompts/${id}/use`, { method: "POST" }).catch(() => {});
  };

  const srcMeta = SOURCE_META[source] ?? SOURCE_META[""];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight">Prompt Library</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {items.length} prompts &middot; {srcMeta.label}: {srcMeta.subtitle}
        </p>
      </div>

      {/* Add Prompt Form */}
      <AddPromptForm
        onAdded={() => {
          setLoading(true);
          fetchItems();
        }}
      />

      {/* Search + Source + Category filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-8"
            />
            {search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button size="sm" onClick={handleSearch} className="gap-1.5">
            <Search className="h-4 w-4" />
            Search
          </Button>
          {hasAnyFilter && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <SourceFilter selected={source} onChange={handleSourceChange} />
        <CategoryFilter selected={category} onChange={handleCategoryChange} />
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardSkeleton />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No prompts found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasAnyFilter
              ? "Try a different filter or search term"
              : "The prompt library is empty"}
          </p>
          {hasAnyFilter && (
            <Button
              className="mt-4"
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <PromptCard
              key={item.id}
              item={item}
              index={i}
              expanded={expandedId === item.id}
              onToggle={() =>
                setExpandedId(expandedId === item.id ? null : item.id)
              }
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          {items.length} prompt{items.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
