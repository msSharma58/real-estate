"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { telHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/queries";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/listings", label: "All listings" },
  { href: "/listings?type=land", label: "Land" },
  { href: "/listings?type=house", label: "Houses" },
  { href: "/listings?type=commercial", label: "Commercial" },
  { href: "/about", label: "About" },
];

export function Navbar({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // Storing the path the menu was opened on lets navigation close it for free,
  // without an effect that reacts to `pathname`.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;

  // The homepage hero sits behind the nav, so the bar starts transparent there.
  const overlay = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !overlay || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-border/70 bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo variant={solid ? "dark" : "light"} />

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                solid
                  ? "text-ink-muted hover:text-ink"
                  : "text-white/75 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telHref(settings.phone)}
            className={cn(
              "hidden items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors sm:flex",
              solid ? "text-ink hover:text-brand" : "text-white/85 hover:text-white",
            )}
          >
            <Phone className="size-3.5" />
            {settings.phone}
          </a>

          <Button
            asChild
            className="hidden rounded-full bg-brand px-5 text-brand-foreground hover:bg-brand-strong sm:inline-flex"
          >
            <Link href="/listings">Browse properties</Link>
          </Button>

          <button
            type="button"
            onClick={() => setOpenedAt(open ? null : pathname)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={cn(
              "grid size-10 place-items-center rounded-full transition-colors lg:hidden",
              solid ? "text-ink hover:bg-muted" : "text-white hover:bg-white/10",
            )}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col px-5 py-3 sm:px-8">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.25 }}
                >
                  <Link
                    href={link.href}
                    className="block border-b border-border/60 py-3.5 text-[0.9375rem] font-medium text-ink last:border-0"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col gap-2 pb-4 pt-4">
                <Button asChild className="rounded-full bg-brand text-brand-foreground hover:bg-brand-strong">
                  <Link href="/listings">Browse properties</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <a href={telHref(settings.phone)}>
                    <Phone className="size-4" /> {settings.phone}
                  </a>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
