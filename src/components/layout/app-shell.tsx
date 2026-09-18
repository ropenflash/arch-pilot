"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, FolderKanban, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import { PRODUCT } from "@/lib/content/product";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/learn", label: "Play" },
  { href: "/design", label: "New design" },
  { href: "/projects", label: "Projects" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-[15px] font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Box className="h-4 w-4" />
          </span>
          {PRODUCT.name}
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground",
                  active && "bg-accent text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/design"
            className="hidden items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground sm:inline-flex"
          >
            <Plus className="h-3.5 w-3.5" />
            {PRODUCT.primaryCta}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
      {PRODUCT.footer}
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function WorkspaceHint() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <FolderKanban className="h-3.5 w-3.5" />
      Saved designs live in Projects. Public share links are read-only.
    </div>
  );
}
