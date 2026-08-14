"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteProperty, setPropertyStatus, toggleFeatured } from "@/app/actions/properties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_STATUSES, PROPERTY_TYPES, STATUS_STYLES } from "@/lib/constants";
import { formatArea, formatDate, formatPrice } from "@/lib/format";
import { storageUrl } from "@/lib/supabase/env";
import type { PropertyStatus } from "@/lib/database.types";
import type { PropertyWithImages } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function ListingsTable({ properties }: { properties: PropertyWithImages[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingDelete, setPendingDelete] = useState<PropertyWithImages | null>(null);
  const [isPending, startTransition] = useTransition();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q)
      );
    });
  }, [properties, query, statusFilter]);

  function changeStatus(id: string, status: PropertyStatus) {
    startTransition(async () => {
      try {
        await setPropertyStatus(id, status);
        toast.success(`Marked as ${status}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update the status");
      }
    });
  }

  function changeFeatured(id: string, featured: boolean) {
    startTransition(async () => {
      try {
        await toggleFeatured(id, featured);
        toast.success(featured ? "Featured on homepage" : "Removed from homepage");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update the listing");
      }
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    startTransition(async () => {
      try {
        await deleteProperty(target.id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete the listing");
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, address or city…"
            aria-label="Search listings"
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PROPERTY_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={cn(
          "mt-6 overflow-hidden rounded-2xl border border-border bg-card transition-opacity",
          isPending && "opacity-60",
        )}
      >
        {rows.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-ink-muted">
            {properties.length === 0
              ? "No listings yet."
              : "No listings match that search."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((p) => {
              const cover = storageUrl(p.images[0]?.storage_path);
              const area = formatArea(p.area, p.area_unit);
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-16">
                    {cover ? (
                      <Image src={cover} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-[0.625rem] text-ink-muted">
                        No photo
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/listings/${p.id}`}
                      className="block text-sm font-medium text-ink transition-colors hover:text-brand sm:truncate"
                    >
                      <span className="line-clamp-2 sm:line-clamp-none">{p.title}</span>
                    </Link>
                    <p className="mt-1 truncate text-xs text-ink-muted">{p.address}</p>

                    {/* Price matters most when scanning on a phone, where the
                        right-hand column is hidden. */}
                    <p className="mt-1.5 text-sm font-semibold text-ink sm:hidden">
                      {formatPrice(p.price)}
                      {p.price_unit !== "total" && (
                        <span className="ml-1 text-[0.6875rem] font-normal text-ink-muted">
                          {p.price_unit}
                        </span>
                      )}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 text-[0.625rem] uppercase tracking-wide",
                          STATUS_STYLES[p.status],
                        )}
                      >
                        {p.status}
                      </Badge>
                      <span className="text-[0.6875rem] text-ink-muted">
                        {PROPERTY_TYPES.find((t) => t.value === p.type)?.label}
                        {area && ` · ${area}`}
                      </span>
                      {p.featured && (
                        <span className="text-[0.6875rem] font-medium text-brand">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-semibold text-ink">{formatPrice(p.price)}</p>
                    <p className="mt-1 text-xs text-ink-muted">{formatDate(p.created_at)}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        aria-label={`Actions for ${p.title}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/listings/${p.id}`}>
                          <Pencil className="size-4" /> Edit listing
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/properties/${p.slug ?? p.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="size-4" /> View on site
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
                        Mark as
                      </DropdownMenuLabel>
                      {PROPERTY_STATUSES.map((s) => (
                        <DropdownMenuItem
                          key={s.value}
                          disabled={p.status === s.value}
                          onSelect={() => changeStatus(p.id, s.value)}
                        >
                          {s.label}
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => changeFeatured(p.id, !p.featured)}>
                        {p.featured ? "Remove from homepage" : "Feature on homepage"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setPendingDelete(p)}
                      >
                        <Trash2 className="size-4" /> Delete listing
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this listing?</DialogTitle>
            <DialogDescription>
              “{pendingDelete?.title}” and its photos will be removed permanently.
              Enquiries already received are kept, but stop showing the property.
              If the deal simply closed, mark it as <strong>sold</strong> instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-full">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" className="rounded-full" onClick={confirmDelete}>
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
