import "server-only";

import { SITE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  InquiryRow,
  ProfileRow,
  PropertyImageRow,
  PropertyRow,
  PropertyStatus,
  PropertyType,
} from "@/lib/database.types";

export type PropertyWithImages = PropertyRow & {
  images: PropertyImageRow[];
};

export type PropertyFilters = {
  q?: string;
  types?: PropertyType[];
  status?: PropertyStatus[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  areaUnit?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "area-desc";
  limit?: number;
  offset?: number;
};

const IMAGE_SELECT = "images:property_images(id, property_id, storage_path, alt, sort_order, created_at)";

function sortImages<T extends { images?: PropertyImageRow[] | null }>(row: T) {
  const images = (row.images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  return { ...row, images } as T & { images: PropertyImageRow[] };
}

/**
 * Public/admin listing query. Sold listings are excluded unless the caller asks
 * for them explicitly — the "show sold" toggle passes them in.
 */
export async function getProperties(
  filters: PropertyFilters = {},
): Promise<{ properties: PropertyWithImages[]; total: number }> {
  if (!isSupabaseConfigured) return { properties: [], total: 0 };

  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select(`*, ${IMAGE_SELECT}`, { count: "exact" });

  const status = filters.status?.length ? filters.status : (["available", "pending"] as PropertyStatus[]);
  query = query.in("status", status);

  if (filters.types?.length) query = query.in("type", filters.types);
  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters.minArea != null) query = query.gte("area", filters.minArea);
  if (filters.maxArea != null) query = query.lte("area", filters.maxArea);
  if (filters.areaUnit) query = query.eq("area_unit", filters.areaUnit);

  if (filters.q?.trim()) {
    const term = `%${filters.q.trim()}%`;
    query = query.or(
      `title.ilike.${term},address.ilike.${term},city.ilike.${term},description.ilike.${term}`,
    );
  }

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "area-desc":
      query = query.order("area", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const limit = filters.limit ?? 24;
  const offset = filters.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("getProperties:", error.message);
    return { properties: [], total: 0 };
  }

  return {
    properties: (data ?? []).map(sortImages) as PropertyWithImages[],
    total: count ?? 0,
  };
}

export async function getFeaturedProperties(limit = 6): Promise<PropertyWithImages[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`*, ${IMAGE_SELECT}`)
    .eq("status", "available")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedProperties:", error.message);
    return [];
  }
  return (data ?? []).map(sortImages) as PropertyWithImages[];
}

export async function getPropertyBySlug(slug: string): Promise<PropertyWithImages | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  const { data, error } = await supabase
    .from("properties")
    .select(`*, ${IMAGE_SELECT}`)
    .eq(isUuid ? "id" : "slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return sortImages(data) as PropertyWithImages;
}

export async function getSimilarProperties(
  property: Pick<PropertyRow, "id" | "type" | "city">,
  limit = 3,
): Promise<PropertyWithImages[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`*, ${IMAGE_SELECT}`)
    .eq("type", property.type)
    .eq("status", "available")
    .neq("id", property.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []).map(sortImages) as PropertyWithImages[];
}

/** Every property slug, for the sitemap and static params. */
export async function getAllPropertySlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .not("slug", "is", null);

  return (data ?? []).filter((r): r is { slug: string; updated_at: string } => Boolean(r.slug));
}

/** Distinct cities, used to populate the location filter. */
export async function getCities(): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("city").not("city", "is", null);
  return Array.from(new Set((data ?? []).map((r) => r.city).filter(Boolean) as string[])).sort();
}

// -----------------------------------------------------------------------------
// Admin
// -----------------------------------------------------------------------------

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data ?? null;
}

export type DashboardStats = {
  total: number;
  available: number;
  pending: number;
  sold: number;
  inquiries: number;
  newInquiries: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    total: 0,
    available: 0,
    pending: 0,
    sold: 0,
    inquiries: 0,
    newInquiries: 0,
  };
  if (!isSupabaseConfigured) return empty;

  const supabase = await createClient();
  const countOf = (status?: PropertyStatus) => {
    const q = supabase.from("properties").select("id", { count: "exact", head: true });
    return status ? q.eq("status", status) : q;
  };

  const [total, available, pending, sold, inquiries, newInquiries] = await Promise.all([
    countOf(),
    countOf("available"),
    countOf("pending"),
    countOf("sold"),
    supabase.from("inquiries").select("id", { count: "exact", head: true }),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("handled", false),
  ]);

  return {
    total: total.count ?? 0,
    available: available.count ?? 0,
    pending: pending.count ?? 0,
    sold: sold.count ?? 0,
    inquiries: inquiries.count ?? 0,
    newInquiries: newInquiries.count ?? 0,
  };
}

/** Admin listing table — includes sold, respects RLS for agents. */
export async function getManagedProperties(): Promise<PropertyWithImages[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`*, ${IMAGE_SELECT}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getManagedProperties:", error.message);
    return [];
  }
  return (data ?? []).map(sortImages) as PropertyWithImages[];
}

export type InquiryWithProperty = InquiryRow & {
  property: Pick<PropertyRow, "id" | "title" | "slug" | "status"> | null;
};

export type SiteSettings = {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  lat: number;
  lng: number;
};

const SITE_SETTINGS_FALLBACK: SiteSettings = {
  name: SITE.name,
  tagline: SITE.tagline,
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  email: SITE.email,
  address: SITE.address,
  lat: SITE.lat,
  lng: SITE.lng,
};

/** Company name, contact details and map pin — editable from `/admin/settings`. */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return SITE_SETTINGS_FALLBACK;

  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (!data) return SITE_SETTINGS_FALLBACK;

  return {
    name: data.name || SITE_SETTINGS_FALLBACK.name,
    tagline: data.tagline || SITE_SETTINGS_FALLBACK.tagline,
    phone: data.phone || SITE_SETTINGS_FALLBACK.phone,
    whatsapp: data.whatsapp || SITE_SETTINGS_FALLBACK.whatsapp,
    email: data.email || SITE_SETTINGS_FALLBACK.email,
    address: data.address || SITE_SETTINGS_FALLBACK.address,
    lat: data.lat ?? SITE_SETTINGS_FALLBACK.lat,
    lng: data.lng ?? SITE_SETTINGS_FALLBACK.lng,
  };
}

export async function getInquiries(limit?: number): Promise<InquiryWithProperty[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  let query = supabase
    .from("inquiries")
    .select("*, property:properties(id, title, slug, status)")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("getInquiries:", error.message);
    return [];
  }
  return (data ?? []) as unknown as InquiryWithProperty[];
}
