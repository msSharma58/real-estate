"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { telHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/queries";
import { cn } from "@/lib/utils";

/**
 * `collection` links are views of one inventory and read as a set.
 * `site` links are ordinary pages and sit apart from that set.
 */
const LINKS = [
  { href: "/listings", label: "All listings", group: "collection" },
  { href: "/listings?type=land", label: "Land", group: "collection" },
  { href: "/listings?type=house", label: "Houses", group: "collection" },
  { href: "/listings?type=commercial", label: "Commercial", group: "collection" },
  { href: "/about", label: "About", group: "site" },
] as const;

const COLLECTION_LINKS = LINKS.filter((l) => l.group === "collection");
const SITE_LINKS = LINKS.filter((l) => l.group === "site");

const MENU_ID = "site-menu";

type Tone = "solid" | "overlay";

/**
 * Which nav item the current URL represents, as an href, or null when none does.
 *
 * The type filter lives in the query string so results stay shareable, which
 * means `usePathname` alone cannot tell four of these five links apart.
 *
 * Deliberately NOT wrapped in `<Suspense>`. The usual advice is to wrap
 * `useSearchParams`, but a boundary declared inside this client component never
 * resolves on the client — the server renders the marked-up nav, then hydration
 * swaps in the fallback permanently (with `fallback={null}`, the nav disappears
 * outright). The site layout calls `connection()` instead, which keeps these
 * routes out of prerendering and is what makes the bare hook safe here.
 */
function useActiveHref(): string | null {
  const pathname = usePathname();
  const params = useSearchParams();

  if (pathname === "/listings") {
    const types = params.getAll("type");
    // Two types at once is a real filter state, but not one any single nav
    // item stands for — better to mark nothing than to mark the wrong one.
    if (types.length > 1) return null;
    return types.length === 1 ? `/listings?type=${types[0]}` : "/listings";
  }

  // Property detail pages deliberately match nothing: "All listings" would
  // suggest tapping it keeps you where you are.
  return LINKS.some((l) => l.href === pathname) ? pathname : null;
}

/* -------------------------------------------------------------------------- */
/* Links                                                                      */
/* -------------------------------------------------------------------------- */

function NavLink({
  href,
  label,
  active,
  tone,
  indicatorId,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  tone: Tone;
  indicatorId: string;
  onNavigate?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const overlay = tone === "overlay";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
        // The step from muted to full strength is the first signal; the filled
        // pill is the second, so state never rests on colour alone.
        overlay
          ? active
            ? "text-white"
            : "text-white/75 hover:text-white"
          : active
            ? "text-ink"
            : "text-ink-muted hover:text-ink",
        overlay && "focus-visible:outline-white",
      )}
    >
      {active && (
        <motion.span
          layoutId={indicatorId}
          // The links already carry `rounded-full` and padding, so the pill was
          // latent in the markup — this just fills it. A neutral wash rather
          // than a brand tint, so it never competes with the red CTA alongside.
          className={cn(
            "absolute inset-0 rounded-full",
            overlay ? "bg-white/15" : "bg-ink/[0.08]",
          )}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 400, damping: 34 }
          }
        />
      )}
      {/* Positioned so it paints above the pill that precedes it. */}
      <span className="relative">{label}</span>
    </Link>
  );
}

/** Desktop run. Proximity does the grouping — no divider needed. */
function DesktopLinks({ tone, active }: { tone: Tone; active: string | null }) {
  return (
    <nav aria-label="Primary" className="hidden items-center lg:flex">
      <div className="flex items-center gap-0.5">
        {COLLECTION_LINKS.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            active={active === link.href}
            tone={tone}
            indicatorId="nav-indicator-desktop"
          />
        ))}
      </div>
      {/* About is a page, not a view of the inventory. A wider interval says so
          without adding a rule to the bar. */}
      <div className="ml-6 flex items-center gap-0.5">
        {SITE_LINKS.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            active={active === link.href}
            tone={tone}
            indicatorId="nav-indicator-desktop"
          />
        ))}
      </div>
    </nav>
  );
}

function ActiveDesktopLinks({ tone }: { tone: Tone }) {
  const active = useActiveHref();
  return <DesktopLinks tone={tone} active={active} />;
}

function MobileLinks({
  active,
  onNavigate,
}: {
  active: string | null;
  onNavigate: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {LINKS.map((link, i) => {
        const isActive = active === link.href;
        return (
          <motion.div
            key={link.href}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { delay: 0.04 * i, duration: 0.25 }
            }
          >
            <Link
              href={link.href}
              // Four of these five share the `/listings` pathname, so nothing
              // derived from the route can tell them apart — the tap that
              // navigates is what closes the menu.
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              // Each row is the only child of its own motion wrapper, so the
              // `last:border-0` that used to sit here matched every row and the
              // dividers never drew. Rather than restore them, the list keeps
              // the same device the desktop run uses: interval and weight, not
              // rules.
              className={cn(
                "flex py-3.5 text-[0.9375rem] font-medium",
                isActive ? "text-ink" : "text-ink-muted",
              )}
            >
              {/* Same pill as the desktop run, hugging the label rather than
                  the full-width row. The negative margins cancel the padding's
                  effect on layout, so an active row is exactly as tall as an
                  inactive one and the list keeps its rhythm. */}
              <span
                className={cn(
                  "-mx-3 -my-1.5 rounded-full px-3 py-1.5",
                  isActive && "bg-ink/[0.08]",
                )}
              >
                {link.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </>
  );
}

function ActiveMobileLinks({ onNavigate }: { onNavigate: () => void }) {
  return <MobileLinks active={useActiveHref()} onNavigate={onNavigate} />;
}

/* -------------------------------------------------------------------------- */

export function Navbar({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // The homepage hero sits behind the nav, so the bar starts transparent there.
  const overlay = pathname === "/";

  // Only the overlay pages care about scroll position. Everywhere else the bar
  // is solid from the first paint, and the listener would re-render for nothing.
  useEffect(() => {
    if (!overlay) return;

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  // Returning focus to the toggle matters on dismissal (Escape), where the
  // element the user was on disappears. On navigation the destination page owns
  // focus instead, so the caller decides.
  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      // The toggle handles its own state on click; closing here first would let
      // that click immediately reopen the menu.
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) {
        return;
      }
      close();
    };

    // Browser back/forward moves route without touching one of our links.
    const onPopState = () => close();

    // Rotating or resizing past `lg` hides the panel and the toggle together,
    // which would otherwise strand the menu open with no way to dismiss it.
    const wide = window.matchMedia("(min-width: 64rem)");
    const onWiden = () => {
      if (wide.matches) close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("popstate", onPopState);
    wide.addEventListener("change", onWiden);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("popstate", onPopState);
      wide.removeEventListener("change", onWiden);
    };
  }, [open, close]);

  const solid = !overlay || scrolled;
  const tone: Tone = solid ? "solid" : "overlay";

  // Over photography the brand-red ring has nothing to contrast against; white
  // clears 12:1 on the graded hero overlay.
  const overlayFocus = solid ? "" : "focus-visible:outline-white";

  return (
    <header
      className={cn(
        // `transition-all` also interpolated `backdrop-filter`, which is
        // expensive per frame and had no reason to animate. Only the colours do.
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300",
        solid
          ? // 85% left secondary text at ~4.6:1 once dark property photography
            // scrolled underneath. 92% holds 5.5:1 and still reads as glass.
            "border-b border-border/70 bg-background supports-[backdrop-filter]:bg-background/92 supports-[backdrop-filter]:backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between gap-4 px-5 sm:gap-6 sm:px-8">
        <Logo variant={solid ? "dark" : "light"} className={cn("min-w-0", overlayFocus)} />

        {/* Reading the query string suspends on any prerendered route. The
            fallback is the same run of links with nothing marked, so the bar
            never shifts when the active state resolves. */}
        <ActiveDesktopLinks tone={tone} />

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={telHref(settings.phone)}
            className={cn(
              "hidden items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors sm:flex",
              solid ? "text-ink hover:text-brand" : "text-white/85 hover:text-white",
              overlayFocus,
            )}
          >
            <Phone className="size-3.5 shrink-0" />
            {settings.phone}
          </a>

          <Button
            asChild
            className={cn(
              // A red button cannot show a red focus ring. Ink on the solid bar,
              // white over the hero — both clear 3:1 against what surrounds them.
              "hidden rounded-full bg-brand px-5 text-brand-foreground hover:bg-brand-strong focus-visible:ring-2 focus-visible:ring-offset-2 sm:inline-flex",
              solid
                ? "focus-visible:ring-ink focus-visible:ring-offset-background"
                : "focus-visible:ring-white focus-visible:ring-offset-transparent",
            )}
          >
            <Link href="/listings">Browse properties</Link>
          </Button>

          {/* Below `sm` the phone number above is hidden and the only route to
              it was two taps inside the menu. On a site whose local buyers
              arrive by phone, the call has to survive the smallest breakpoint —
              so the number collapses to an icon here rather than disappearing. */}
          <a
            href={telHref(settings.phone)}
            aria-label={`Call ${settings.phone}`}
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full transition-colors sm:hidden",
              solid ? "text-ink hover:bg-muted" : "text-white hover:bg-white/10",
              overlayFocus,
            )}
          >
            <Phone className="size-5" />
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={MENU_ID}
            className={cn(
              // 44px: the only navigation control below `sm`, on a site whose
              // local buyers arrive by phone.
              "grid size-11 place-items-center rounded-full transition-colors lg:hidden",
              solid ? "text-ink hover:bg-muted" : "text-white hover:bg-white/10",
              overlayFocus,
            )}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={MENU_ID}
            ref={panelRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
            }
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            {/* The panel lives inside a fixed header, so anything past the fold
                was unreachable — on a landscape phone that was the CTA and the
                phone number. Cap it to the viewport that is left and scroll. */}
            <nav
              aria-label="Primary menu"
              className="mx-auto flex max-h-[calc(100svh-var(--header-h))] max-w-7xl flex-col overflow-y-auto overscroll-contain px-5 py-3 sm:px-8"
            >
              <ActiveMobileLinks onNavigate={() => close()} />

              <div className="flex shrink-0 flex-col gap-2 pb-4 pt-4">
                <Button
                  asChild
                  className="rounded-full bg-brand text-brand-foreground hover:bg-brand-strong focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Link href="/listings" onClick={() => close()}>
                    Browse properties
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <a href={telHref(settings.phone)} onClick={() => close()}>
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
