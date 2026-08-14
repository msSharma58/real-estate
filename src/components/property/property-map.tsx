import { ExternalLink, MapPin } from "lucide-react";

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

/**
 * Location map.
 *
 * Uses the Google Maps Embed API when a key is configured, and falls back to
 * an OpenStreetMap embed otherwise — so the map works before any API key
 * exists, exactly as the spec allows.
 */
export function PropertyMap({
  lat,
  lng,
  address,
  zoom = 15,
  className,
}: {
  lat: number | null;
  lng: number | null;
  address: string;
  zoom?: number;
  className?: string;
}) {
  if (lat == null || lng == null) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/50 px-5 py-8 text-sm text-ink-muted">
        <MapPin className="size-4 shrink-0" />
        <span>
          No map pin set for this property yet. Call us and we&rsquo;ll send the
          location directly.
        </span>
      </div>
    );
  }

  const src = GOOGLE_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_KEY}&q=${lat},${lng}&zoom=${zoom}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.005}%2C${lng + 0.008}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-border">
        <iframe
          src={src}
          title={`Map showing ${address}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-[16/10] w-full border-0 sm:aspect-[2/1]"
        />
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-strong"
      >
        Open in Google Maps
        <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}
