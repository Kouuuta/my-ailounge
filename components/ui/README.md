# `components/ui/` — shadcn/ui Primitives

11 UI components, standard shadcn/ui with minimal customization.

## Component Reference

| Component | `"use client"` | Radix Dependency | Variants / Sub-components |
|-----------|---------------|------------------|---------------------------|
| **Button** | No | `@radix-ui/react-slot` | 5 variants (default, destructive, outline, secondary, ghost, link), 4 sizes (default, sm, lg, icon), `asChild` prop |
| **Card** | No | — | 7 sub-components: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| **Badge** | No | — | 4 variants (default, secondary, destructive, outline) via `cva` |
| **Input** | No | — | ForwardRef, standard HTML input props, `type` prop |
| **Select** | Yes | `@radix-ui/react-select` | 10 exports: Root, Group, Value, Trigger, Content, Label, Item, Separator, ScrollUpButton, ScrollDownButton |
| **Tabs** | Yes | `@radix-ui/react-tabs` | 3 exports: TabsList, TabsTrigger, TabsContent |
| **Toggle** | Yes | `@radix-ui/react-toggle` | 2 variants (default, outline), 3 sizes (default, sm, lg) via `cva` |
| **Separator** | Yes | `@radix-ui/react-separator` | Orientation prop: `horizontal` (default) or `vertical` |
| **Table** | No | — | 6 sub-components: Table, TableHeader, TableBody, TableRow, TableHead, TableCell |
| **Skeleton** | No | — | `Skeleton` (shimmer animation) + `CardSkeleton` + `StatCardSkeleton` composite loaders |
| **Navbar** | Yes | — | Sticky top nav, 3 nav items (Briefing, Feed, Stack), active route highlight, theme toggle button |

## Usage Notes

- All components import `cn()` from `@/lib/utils`
- Components without `"use client"` can be used in Server Components
- `"use client"` components use Radix primitives that require browser APIs (interactivity, portals, etc.)
- Semicolons on `"use client"` directives are inconsistent across files — match the file you're editing
