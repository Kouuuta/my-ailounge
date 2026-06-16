"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sun, Moon, PanelTop, Wrench } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Briefing" },
  { href: "/feed", label: "Feed" },
  { href: "/watchlist", label: "Stack", icon: Wrench },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <PanelTop className="h-5 w-5 text-accent-vibrant" />
          <span>Dashboard</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-foreground hover:bg-accent/50"
              )}
            >
              {item.label}
              {pathname === item.href && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-vibrant" />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto">
          <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8" title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
