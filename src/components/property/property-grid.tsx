import Link from "next/link";
import { SearchX } from "lucide-react";

import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import type { PropertyWithImages } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function PropertyGrid({
  properties,
  className,
  priorityCount = 3,
  empty,
}: {
  properties: PropertyWithImages[];
  className?: string;
  priorityCount?: number;
  /** Replaces the default "no filter matches" copy where filters aren't in play. */
  empty?: React.ReactNode;
}) {
  if (properties.length === 0) return empty ?? <EmptyState />;

  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {properties.map((property, i) => (
        <PropertyCard
          key={property.id}
          property={property}
          index={i}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title = "No properties match those filters",
  description = "Try widening the price or area range, or clear the filters to see everything we have listed.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-20 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-brand-tint">
        <SearchX className="size-5 text-brand" />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>
      <div className="mt-6">
        {action ?? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/listings">Clear filters</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
