import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Compass,
  MapPin,
  Maximize2,
  Phone,
  Route,
  Tag,
} from "lucide-react";

import { Gallery } from "@/components/property/gallery";
import { InquiryForm } from "@/components/property/inquiry-form";
import { PropertyMap } from "@/components/property/property-map";
import { PropertyGrid } from "@/components/property/property-grid";
import { SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { PROPERTY_TYPES, SITE, STATUS_STYLES } from "@/lib/constants";
import {
  formatArea,
  formatDate,
  formatPrice,
  formatPriceExact,
  telHref,
  whatsappHref,
} from "@/lib/format";
import { getPropertyBySlug, getSimilarProperties, getSiteSettings } from "@/lib/queries";
import { storageUrl } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Property not found" };

  const area = formatArea(property.area, property.area_unit);
  const description =
    property.description?.slice(0, 155) ??
    `${area ? `${area} ` : ""}${property.type} at ${property.address}, priced at ${formatPrice(property.price)}.`;
  const image = storageUrl(property.images[0]?.storage_path);

  return {
    title: property.title,
    description,
    alternates: { canonical: `/properties/${property.slug ?? property.id}` },
    openGraph: {
      title: property.title,
      description,
      type: "article",
      images: image ? [{ url: image, width: 1200, height: 900 }] : undefined,
    },
  };
}

export default async function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [similar, settings] = await Promise.all([
    getSimilarProperties(property),
    getSiteSettings(),
  ]);
  const area = formatArea(property.area, property.area_unit);
  const typeLabel = PROPERTY_TYPES.find((t) => t.value === property.type)?.label ?? property.type;
  const image = storageUrl(property.images[0]?.storage_path);

  const specs = [
    { icon: Tag, label: "Type", value: typeLabel },
    { icon: Maximize2, label: "Area", value: area ?? "—" },
    {
      icon: Compass,
      label: "Price basis",
      value: property.price_unit === "total" ? "Total price" : property.price_unit,
    },
    { icon: Route, label: "Road access", value: property.road_access ?? "—" },
    { icon: MapPin, label: "Location", value: property.address },
    { icon: CalendarDays, label: "Listed", value: formatDate(property.created_at) },
  ];

  // Structured data so listings surface properly in search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? undefined,
    url: `${SITE.url}/properties/${property.slug ?? property.id}`,
    image: image ?? undefined,
    datePosted: property.created_at,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "NPR",
      availability:
        property.status === "available"
          ? "https://schema.org/InStock"
          : property.status === "pending"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/SoldOut",
    },
    address: { "@type": "PostalAddress", streetAddress: property.address, addressCountry: "NP" },
    ...(property.lat != null && property.lng != null
      ? { geo: { "@type": "GeoCoordinates", latitude: property.lat, longitude: property.lng } }
      : {}),
  };

  return (
    <div className="pt-18">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to listings
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-8 sm:px-8 lg:grid-cols-[1.65fr_1fr] lg:gap-14">
        <div className="min-w-0">
          <Gallery images={property.images} title={property.title} />

          <header className="mt-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ink px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white">
                {typeLabel}
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] ring-1 ring-inset",
                  STATUS_STYLES[property.status],
                )}
              >
                {property.status === "pending"
                  ? "Under offer"
                  : property.status === "sold"
                    ? "Sold"
                    : "Available"}
              </span>
            </div>

            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-ink sm:text-[2.75rem]">
              {property.title}
            </h1>

            <p className="mt-4 flex items-center gap-2 text-[1.0625rem] text-ink-muted">
              <MapPin className="size-4 shrink-0 text-brand" />
              {property.address}
            </p>
          </header>

          <section className="mt-10 grid gap-x-8 gap-y-6 rounded-2xl border border-border bg-muted/30 p-7 sm:grid-cols-2 lg:grid-cols-3">
            {specs.map((spec) => (
              <div key={spec.label}>
                <p className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  <spec.icon className="size-3.5 text-brand" />
                  {spec.label}
                </p>
                <p className="mt-1.5 text-[0.9375rem] font-medium leading-snug text-ink">
                  {spec.value}
                </p>
              </div>
            ))}
          </section>

          {property.description && (
            <section className="mt-12">
              <h2 className="font-display text-xl font-semibold text-ink">
                About this property
              </h2>
              <div className="mt-4 space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted">
                {property.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold text-ink">Location</h2>
            <p className="mt-2 text-[0.9375rem] text-ink-muted">{property.address}</p>
            <PropertyMap
              lat={property.lat}
              lng={property.lng}
              address={property.address}
              className="mt-5"
            />
          </section>
        </div>

        {/* Sticky enquiry rail */}
        <aside className="lg:relative">
          <div className="lg:sticky lg:top-28 lg:space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                {property.price_unit === "total" ? "Asking price" : `Price ${property.price_unit}`}
              </p>
              <p className="mt-2 font-display text-4xl font-semibold leading-none text-ink">
                {formatPrice(property.price)}
              </p>
              <p className="mt-2 text-sm text-ink-muted">{formatPriceExact(property.price)}</p>

              {area && (
                <p className="mt-5 border-t border-border pt-5 text-sm text-ink-muted">
                  <span className="font-medium text-ink">{area}</span>
                  {property.price_unit === "total" && property.area
                    ? ` · ${formatPrice(property.price / property.area)} per ${property.area_unit}`
                    : ""}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-2.5">
                <Button
                  asChild
                  className="rounded-full bg-ink text-white hover:bg-ink/90"
                >
                  <a href={telHref(settings.phone)}>
                    <Phone className="size-4" /> Call {settings.phone}
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <a
                    href={whatsappHref(
                      settings.whatsapp,
                      `Hi ${settings.name}, I'm interested in "${property.title}".`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ask on WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <InquiryForm
              propertyId={property.id}
              propertySlug={property.slug}
              propertyTitle={property.title}
            />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <SectionHeading
              eyebrow="Similar listings"
              title={`More ${typeLabel.toLowerCase()} on our books`}
            />
            <div className="mt-10">
              <PropertyGrid properties={similar} priorityCount={0} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
