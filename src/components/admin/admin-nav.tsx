"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, LayoutDashboard, LogOut, MessageSquare, Plus, Settings } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { LogoMark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import type { ProfileRow } from "@/lib/database.types";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/listings", label: "Listings", icon: Building2 },
  { href: "/admin/inquiries", label: "Enquiries", icon: MessageSquare },
];

export function AdminNav({
  profile,
  newInquiries,
}: {
  profile: ProfileRow | null;
  newInquiries: number;
}) {
  const pathname = usePathname();
  const links =
    profile?.role === "admin"
      ? [...LINKS, { href: "/admin/settings", label: "Settings", icon: Settings }]
      : LINKS;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <LogoMark variant="light" className="h-7 w-auto shrink-0" />
        <div className="leading-none">
          <p className="font-display text-[0.9375rem] font-semibold text-white">Prime</p>
          <p className="mt-0.5 text-[0.625rem] uppercase tracking-[0.16em] text-white/45">
            Admin
          </p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Button
          asChild
          className="w-full rounded-lg bg-brand text-brand-foreground hover:bg-brand-strong"
        >
          <Link href="/admin/listings/new">
            <Plus className="size-4" /> New listing
          </Link>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "text-white" : "text-white/55 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-nav-active"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 -z-10 rounded-lg bg-white/10"
                />
              )}
              <link.icon className="size-4 shrink-0" />
              {link.label}
              {link.href === "/admin/inquiries" && newInquiries > 0 && (
                <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-brand px-1.5 py-0.5 text-[0.6875rem] font-semibold text-brand-foreground">
                  {newInquiries}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        {profile && (
          <div className="px-2 pb-3">
            <p className="truncate text-sm font-medium text-white">{profile.name}</p>
            <p className="mt-0.5 text-xs capitalize text-white/45">{profile.role}</p>
          </div>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
