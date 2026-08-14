"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AREA_UNITS, PROPERTY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "area-desc", label: "Largest area" },
];

/** Reads and writes filter state through the URL, so results stay shareable. */
function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setParams = useCallback(
    (patch: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        params.delete(key);
        if (Array.isArray(value)) {
          for (const v of value) params.append(key, v);
        } else if (value) {
          params.set(key, value);
        }
      }
      params.delete("page");
      startTransition(() => {
        // `scroll: false` keeps the reader's place while results swap in.
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  return { searchParams, setParams, pending };
}

function FilterFields({ onDone }: { onDone?: () => void }) {
  const { searchParams, setParams } = useFilterParams();

  const types = searchParams.getAll("type");
  const showSold = searchParams.get("showSold") === "1";
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [minArea, setMinArea] = useState(searchParams.get("minArea") ?? "");
  const [maxArea, setMaxArea] = useState(searchParams.get("maxArea") ?? "");

  // Debounce the free-number inputs so each keystroke isn't a new query.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setParams({
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        minArea: minArea || null,
        maxArea: maxArea || null,
      });
    }, 450);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // setParams is stable per render of the URL; re-running on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice, minArea, maxArea]);

  function toggleType(value: string, checked: boolean) {
    const next = checked ? [...types, value] : types.filter((t) => t !== value);
    setParams({ type: next });
  }

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="eyebrow">Property type</legend>
        <div className="mt-4 space-y-3">
          {PROPERTY_TYPES.map((t) => (
            <div key={t.value} className="flex items-center gap-3">
              <Checkbox
                id={`type-${t.value}`}
                checked={types.includes(t.value)}
                onCheckedChange={(c) => toggleType(t.value, c === true)}
              />
              <Label
                htmlFor={`type-${t.value}`}
                className="cursor-pointer text-sm font-normal text-ink"
              >
                {t.label}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow">Price range (NPR)</legend>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="minPrice" className="text-xs text-ink-muted">
              Minimum
            </Label>
            <Input
              id="minPrice"
              inputMode="numeric"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxPrice" className="text-xs text-ink-muted">
              Maximum
            </Label>
            <Input
              id="maxPrice"
              inputMode="numeric"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow">Area</legend>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="minArea" className="text-xs text-ink-muted">
              Minimum
            </Label>
            <Input
              id="minArea"
              inputMode="decimal"
              placeholder="0"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxArea" className="text-xs text-ink-muted">
              Maximum
            </Label>
            <Input
              id="maxArea"
              inputMode="decimal"
              placeholder="Any"
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <Label className="text-xs text-ink-muted">Unit</Label>
          <Select
            value={searchParams.get("areaUnit") ?? "any"}
            onValueChange={(v) => setParams({ areaUnit: v === "any" ? null : v })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any unit</SelectItem>
              {AREA_UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow">Availability</legend>
        <div className="mt-4 flex items-center gap-3">
          <Checkbox
            id="showSold"
            checked={showSold}
            onCheckedChange={(c) => setParams({ showSold: c === true ? "1" : null })}
          />
          <Label htmlFor="showSold" className="cursor-pointer text-sm font-normal text-ink">
            Include sold properties
          </Label>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Sold listings are hidden by default. Turn this on to see what has
          recently moved in an area.
        </p>
      </fieldset>

      {onDone && (
        <Button
          onClick={onDone}
          className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand-strong"
        >
          Show results
        </Button>
      )}
    </div>
  );
}

export function FiltersSidebar() {
  const { searchParams, pending } = useFilterParams();
  const activeCount =
    searchParams.getAll("type").length +
    ["minPrice", "maxPrice", "minArea", "maxArea", "areaUnit", "showSold", "q"].filter((k) =>
      searchParams.get(k),
    ).length;

  return (
    <aside className="hidden w-72 shrink-0 lg:block">
      <div className="sticky top-28 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">Filters</h2>
          {pending ? (
            <Loader2 className="size-4 animate-spin text-brand" />
          ) : activeCount > 0 ? (
            <ClearButton />
          ) : null}
        </div>
        <div className="mt-6">
          <FilterFields />
        </div>
      </div>
    </aside>
  );
}

function ClearButton() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { scroll: false })}
      className="text-xs font-medium text-brand transition-colors hover:text-brand-strong"
    >
      Clear all
    </button>
  );
}

/** Mobile: the same fields, slid in from the right. */
export function FiltersDrawer() {
  const [open, setOpen] = useState(false);
  const { searchParams } = useFilterParams();
  const activeCount =
    searchParams.getAll("type").length +
    ["minPrice", "maxPrice", "minArea", "maxArea", "areaUnit", "showSold"].filter((k) =>
      searchParams.get(k),
    ).length;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="rounded-full lg:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 grid size-5 place-items-center rounded-full bg-brand text-[0.6875rem] font-semibold text-brand-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px] lg:hidden"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(22rem,90vw)] flex-col bg-background shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <h2 className="font-display text-lg font-semibold text-ink">Filters</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="grid size-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-muted hover:text-ink"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <FilterFields onDone={() => setOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/** Sort control — sits above the grid rather than inside the filter panel. */
export function SortSelect() {
  const { searchParams, setParams } = useFilterParams();
  return (
    <Select
      value={searchParams.get("sort") ?? "newest"}
      onValueChange={(v) => setParams({ sort: v === "newest" ? null : v })}
    >
      <SelectTrigger className="w-full min-w-0 flex-1 rounded-full sm:w-[11rem] sm:flex-none" aria-label="Sort results">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORTS.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Keyword box that lives above the results grid. */
export function ListingSearch({ className }: { className?: string }) {
  const { searchParams, setParams } = useFilterParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setParams({ q: value || null }), 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search listings…"
      aria-label="Search listings"
      className={cn("rounded-full", className)}
    />
  );
}
