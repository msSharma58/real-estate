/**
 * Supabase env resolution.
 *
 * Supports both the legacy `ANON_KEY` naming and the newer `PUBLISHABLE_KEY`
 * naming so the project works with an existing Supabase project either way.
 *
 * Every read is tolerant of missing config: the site renders (with empty
 * states) before Supabase is connected, so `next build` never fails on a
 * fresh clone.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Public storage bucket holding property photos. */
export const PROPERTY_IMAGE_BUCKET = "property-images";

/** Public URL for a file in the property image bucket. */
export function storageUrl(path: string | null | undefined): string | null {
  if (!path || !SUPABASE_URL) return null;
  if (path.startsWith("http")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${PROPERTY_IMAGE_BUCKET}/${path}`;
}
