import { Suspense } from "react";
import type { Metadata } from "next";

import {
  FiltersDrawer,
  FiltersSidebar,
  ListingSearch,
  SortSelect,
} from "@/components/property/filters-panel";
import { PropertyGrid } from "@/components/property/property-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { PROPERTY_TYPES } from "@/lib/constants";
import { getProperties, type PropertyFilters } from "@/lib/queries";
import type { PropertyStatus, PropertyType } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Properties for sale",
  description:
    "Browse land, houses, apartments and commercial property for sale in Butwal, Rupandehi and across Lumbini province. Filter by type, price and area.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function asNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function parseFilters(params: SearchParams): PropertyFilters {
  const validTypes = new Set(PROPERTY_TYPES.map((t) => t.value));
  const types = asArray(params.type).filter((t): t is PropertyType =>
    validTypes.has(t as PropertyType),
  );

  const status: PropertyStatus[] =
    params.showSold === "1"
      ? ["available", "pending", "sold"]
      : ["available", "pending"];

  const sortParam = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort = (["price-asc", "price-desc", "area-desc"] as const).includes(
    sortParam as never,
  )
    ? (sortParam as PropertyFilters["sort"])
    : "newest";

  const areaUnit = Array.isArray(params.areaUnit) ? params.areaUnit[0] : params.areaUnit;
  const q = Array.isArray(params.q) ? params.q[0] : params.q;

  return {
    q,
    types,
    status,
    minPrice: asNumber(params.minPrice),
    maxPrice: asNumber(params.maxPrice),
    minArea: asNumber(params.minArea),
    maxArea: asNumber(params.maxArea),
    areaUnit: areaUnit || undefined,
    sort,
    limit: 48,
  };
}

/** Human summary of the active filters, used as the page heading. */
function headingFor(filters: PropertyFilters): string {
  if (filters.types?.length === 1) {
    const t = PROPERTY_TYPES.find((x) => x.value === filters.types![0]);
    if (t) return `${t.plural} for sale`;
  }
  return "Properties for sale";
}

async function Results({ params }: { params: SearchParams }) {
  const filters = parseFilters(params);
  const { properties, total } = await getProperties(filters);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">
          <span className="font-semibold text-ink">{total}</span>{" "}
          {total === 1 ? "property" : "properties"}
          {params.showSold === "1" && " (including sold)"}
        </p>
        {/* Phones get the search box on its own line — three controls in one
            375px row squeezes the input down to a few characters. */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <ListingSearch className="w-full sm:w-56" />
          <div className="flex items-center gap-2">
            <SortSelect />
            <FiltersDrawer />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <PropertyGrid properties={properties} />
      </div>
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ListingsPage({ searchParams }: PageProps<"/listings">) {
  const params = (await searchParams) as SearchParams;
  const filters = parseFilters(params);

  return (
    <div className="pt-18">
      <header className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <p className="eyebrow">Listings</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            {headingFor(filters)}
          </h1>
          <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">
            Everything currently on our books across Butwal, Rupandehi and the
            surrounding districts. Prices are stated in full — there is nothing
            added at the table.
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-10 px-5 py-12 sm:px-8">
        <Suspense fallback={null}>
          <FiltersSidebar />
        </Suspense>

        <div className="min-w-0 flex-1">
          <Suspense key={JSON.stringify(params)} fallback={<ResultsSkeleton />}>
            <Results params={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
