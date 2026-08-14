import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ListingsTable } from "@/components/admin/listings-table";
import { Button } from "@/components/ui/button";
import { getManagedProperties } from "@/lib/queries";

export const metadata: Metadata = { title: "Listings" };

export default async function AdminListingsPage() {
  const properties = await getManagedProperties();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Listings</h1>
          <p className="mt-2 text-[0.9375rem] text-ink-muted">
            {properties.length === 0
              ? "Nothing here yet."
              : `${properties.length} ${properties.length === 1 ? "listing" : "listings"}, including sold.`}
          </p>
        </div>
        <Button asChild className="rounded-full bg-ink text-white hover:bg-ink/90">
          <Link href="/admin/listings/new">
            <Plus className="size-4" /> New listing
          </Link>
        </Button>
      </header>

      <div className="mt-8">
        <ListingsTable properties={properties} />
      </div>
    </div>
  );
}
