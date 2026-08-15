"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  User,
  X,
} from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { Logo, LogoMark } from "@/components/site/logo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ProfileRow } from "@/lib/database.types";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/listings", label: "Listings", icon: Building2 },
  { href: "/admin/inquiries", label: "Enquiries", icon: MessageSquare },
];

/**
 * Phone navigation for the admin panel.
 *
 * The team works from their phones, so the primary destinations sit in a
 * thumb-reachable bottom bar with the "new listing" action raised in the
 * middle. Account-level items live behind the avatar in the top bar.
 */
export function AdminMobileNav({
  profile,
  newInquiries,
}: {
  profile: ProfileRow | null;
  newInquiries: number;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = profile?.role === "admin";

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      {/* Top bar — identity and account menu */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="h-6 w-auto" />
          <span className="font-wordmark text-sm font-bold text-ink">
            Prime <span className="text-ink-muted">Admin</span>
          </span>
        </Link>

        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className="grid size-11 place-items-center rounded-full bg-muted text-ink"
          >
            <User className="size-4.5" />
          </button>
        </SheetTrigger>
      </header>

      {/* Bottom tab bar */}
      <nav
        aria-label="Admin sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {TABS.map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href) && !pathname.includes("/new");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors",
                  active ? "text-brand" : "text-ink-muted",
                )}
              >
                <span className="relative">
                  <tab.icon className="size-5" />
                  {tab.href === "/admin/inquiries" && newInquiries > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[0.625rem] font-semibold leading-4 text-brand-foreground">
                      {newInquiries > 9 ? "9+" : newInquiries}
                    </span>
                  )}
                </span>
                {tab.label}
              </Link>
            );
          })}

          <Link
            href="/admin/listings/new"
            className="flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium text-ink-muted"
          >
            <span className="grid size-8 place-items-center rounded-full bg-brand text-brand-foreground">
              <Plus className="size-5" />
            </span>
            Add
          </Link>
        </div>
      </nav>

      {/* Account sheet — Radix handles focus trap, Escape and scroll lock, which
          the hand-rolled version claimed via aria-modal but never implemented. */}
      <SheetContent
        side="bottom"
        showCloseButton={false}
        aria-describedby={undefined}
        overlayClassName="bg-black/45 lg:hidden"
        className="gap-0 rounded-t-2xl border-t-0 bg-background p-5 lg:hidden"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <SheetTitle className="sr-only">Account</SheetTitle>

        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <Logo href="/admin" />
            {profile && (
              <p className="mt-3 truncate text-sm text-ink-muted">
                {profile.name} · <span className="capitalize">{profile.role}</span>
              </p>
            )}
          </div>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="grid size-11 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </SheetClose>
        </div>

        <div className="mt-5 space-y-1 border-t border-border pt-4">
          {isAdmin && (
            <SheetClose asChild>
              <Link
                href="/admin/settings"
                className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium text-ink hover:bg-muted"
              >
                <Settings className="size-4.5 text-ink-muted" />
                Site settings
              </Link>
            </SheetClose>
          )}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium text-ink hover:bg-muted"
          >
            <ExternalLink className="size-4.5 text-ink-muted" />
            View public site
          </a>
          <form action={signOut}>
            <button
              type="submit"
              className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium text-destructive hover:bg-destructive/8"
            >
              <LogOut className="size-4.5" />
              Sign out
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
