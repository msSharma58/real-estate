import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { PropertyForm } from "@/components/admin/property-form";
import { Badge } from "@/components/ui/badge";
import { STATUS_STYLES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getPropertyBySlug } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({ params }: PageProps<"/admin/listings/[id]">) {
  const { id } = await params;
  const property = await getPropertyBySlug(id);
  if (!property) notFound();

  const { images, ...row } = property;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        All listings
      </Link>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold leading-tight text-ink">
            {property.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className={cn("border-0 text-[0.625rem] uppercase", STATUS_STYLES[property.status])}
            >
              {property.status}
            </Badge>
            <span className="text-xs text-ink-muted">
              Added {formatDate(property.created_at)} · Updated{" "}
              {formatDate(property.updated_at)}
            </span>
          </div>
        </div>

        <Link
          href={`/properties/${property.slug ?? property.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-strong"
        >
          View on site <ExternalLink className="size-3.5" />
        </Link>
      </header>

      <div className="mt-8">
        <PropertyForm property={row} images={images} />
      </div>
    </div>
  );
}
