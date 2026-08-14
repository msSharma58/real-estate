"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Maximize2, Route } from "lucide-react";

import { PROPERTY_TYPES, STATUS_STYLES } from "@/lib/constants";
import { formatArea, formatPrice } from "@/lib/format";
import { storageUrl } from "@/lib/supabase/env";
import type { PropertyWithImages } from "@/lib/queries";
import { cn } from "@/lib/utils";

function typeLabel(value: string) {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function PropertyCard({
  property,
  index = 0,
  priority = false,
}: {
  property: PropertyWithImages;
  index?: number;
  priority?: boolean;
}) {
  const cover = storageUrl(property.images[0]?.storage_path);
  const area = formatArea(property.area, property.area_unit);
  const href = `/properties/${property.slug ?? property.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index, 7) * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]"
    >
      <Link href={href} className="absolute inset-0 z-10" aria-label={property.title}>
        <span className="sr-only">View {property.title}</span>
      </Link>

      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={property.images[0]?.alt ?? property.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
            <span className="font-display text-sm text-ink-muted">No photo yet</span>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3.5">
          <span className="rounded-full bg-white/92 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink backdrop-blur">
            {typeLabel(property.type)}
          </span>
          {property.status !== "available" && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] ring-1 ring-inset",
                STATUS_STYLES[property.status],
              )}
            >
              {property.status === "pending" ? "Under offer" : "Sold"}
            </span>
          )}
        </div>

        {/* Price sits on the photo so the grid scans by value first. */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 pt-10">
          <p className="font-display text-xl font-semibold text-white">
            {formatPrice(property.price)}
            {property.price_unit && property.price_unit !== "total" && (
              <span className="ml-1.5 text-xs font-normal text-white/70">
                {property.price_unit}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[1.0625rem] font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
          {property.title}
        </h3>

        <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-muted">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span className="line-clamp-1">{property.address}</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-[0.8125rem] text-ink-muted">
          {area && (
            <span className="flex items-center gap-1.5">
              <Maximize2 className="size-3.5 text-brand" />
              {area}
            </span>
          )}
          {property.road_access && (
            <span className="flex items-center gap-1.5">
              <Route className="size-3.5 text-brand" />
              <span className="line-clamp-1">{property.road_access}</span>
            </span>
          )}
          {/* Touch devices have no hover, so the affordance stays visible there
              and only becomes a hover reveal on pointer-capable screens. */}
          <span className="ml-auto flex items-center gap-1 font-medium text-ink transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
            View <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
