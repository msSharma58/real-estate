"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { AREA_UNITS, PRICE_UNITS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_IMAGE_BUCKET, isSupabaseConfigured } from "@/lib/supabase/env";

const numberish = (label: string) =>
  z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : v.trim()))
    .refine((v) => v !== "" && Number.isFinite(Number(v)), `${label} must be a number`)
    .transform((v) => Number(v));

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined) return null;
    const s = typeof v === "number" ? String(v) : v.trim();
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  });

const propertySchema = z.object({
  title: z.string().trim().min(4, "Give the listing a descriptive title").max(180),
  type: z.enum(["land", "house", "apartment", "commercial"]),
  status: z.enum(["available", "pending", "sold"]),
  price: numberish("Price"),
  price_unit: z.enum(PRICE_UNITS),
  area: optionalNumber,
  area_unit: z.enum(AREA_UNITS),
  address: z.string().trim().min(3, "Enter the location"),
  city: z.string().trim().max(120).optional().nullable(),
  lat: optionalNumber,
  lng: optionalNumber,
  description: z.string().trim().max(8000).optional().nullable(),
  road_access: z.string().trim().max(200).optional().nullable(),
  featured: z.boolean(),
});

export type PropertyFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

function readForm(formData: FormData) {
  return {
    title: formData.get("title") ?? "",
    type: formData.get("type") ?? "land",
    status: formData.get("status") ?? "available",
    price: formData.get("price") ?? "",
    price_unit: formData.get("price_unit") ?? "total",
    area: formData.get("area") ?? "",
    area_unit: formData.get("area_unit") ?? "aana",
    address: formData.get("address") ?? "",
    city: formData.get("city") ?? "",
    lat: formData.get("lat") ?? "",
    lng: formData.get("lng") ?? "",
    description: formData.get("description") ?? "",
    road_access: formData.get("road_access") ?? "",
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
  };
}

function collectErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function revalidateEverywhere(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/listings");
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  if (slug) revalidatePath(`/properties/${slug}`);
}

export async function createProperty(
  _prev: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Supabase isn't connected yet." };
  }

  const parsed = propertySchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: collectErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Your session expired. Sign in again." };

  const { data, error } = await supabase
    .from("properties")
    .insert({
      ...parsed.data,
      city: parsed.data.city || null,
      description: parsed.data.description || null,
      road_access: parsed.data.road_access || null,
      created_by: user.id,
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    console.error("createProperty:", error?.message);
    return { status: "error", message: error?.message ?? "Could not save the listing." };
  }

  // Photos uploaded before the property existed are staged client-side and
  // attached here, in the order the team arranged them.
  const stagedPaths = formData.getAll("imagePath").map(String).filter(Boolean);
  if (stagedPaths.length > 0) {
    const { error: imageError } = await supabase.from("property_images").insert(
      stagedPaths.map((storage_path, i) => ({
        property_id: data.id,
        storage_path,
        sort_order: i,
      })),
    );
    if (imageError) console.error("createProperty images:", imageError.message);
  }

  revalidateEverywhere(data.slug);
  redirect(`/admin/listings/${data.id}?created=1`);
}

export async function updateProperty(
  _prev: PropertyFormState,
  formData: FormData,
): Promise<PropertyFormState> {
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Supabase isn't connected yet." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing listing id." };

  const parsed = propertySchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: collectErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .update({
      ...parsed.data,
      city: parsed.data.city || null,
      description: parsed.data.description || null,
      road_access: parsed.data.road_access || null,
    })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) {
    console.error("updateProperty:", error.message);
    return { status: "error", message: error.message };
  }

  revalidateEverywhere(data?.slug);
  revalidatePath(`/admin/listings/${id}`);
  return { status: "idle", message: "Saved" };
}

export async function setPropertyStatus(id: string, status: "available" | "pending" | "sold") {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateEverywhere();
  revalidatePath(`/admin/listings/${id}`);
}

export async function toggleFeatured(id: string, featured: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").update({ featured }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateEverywhere();
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();

  // Remove the stored files first — the DB rows cascade, but storage does not.
  const { data: images } = await supabase
    .from("property_images")
    .select("storage_path")
    .eq("property_id", id);

  const paths = (images ?? []).map((i) => i.storage_path);
  if (paths.length > 0) {
    await supabase.storage.from(PROPERTY_IMAGE_BUCKET).remove(paths);
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateEverywhere();
  redirect("/admin/listings");
}

// -----------------------------------------------------------------------------
// Images
// -----------------------------------------------------------------------------

/** Records an already-uploaded storage object against a saved property. */
export async function attachImage(propertyId: string, storagePath: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("property_images")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const { error } = await supabase.from("property_images").insert({
    property_id: propertyId,
    storage_path: storagePath,
    sort_order: count ?? 0,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/listings/${propertyId}`);
  revalidateEverywhere();
}

export async function removeImage(imageId: string, propertyId: string) {
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("property_images")
    .select("storage_path")
    .eq("id", imageId)
    .maybeSingle();

  const { error } = await supabase.from("property_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);

  if (image?.storage_path) {
    await supabase.storage.from(PROPERTY_IMAGE_BUCKET).remove([image.storage_path]);
  }

  revalidatePath(`/admin/listings/${propertyId}`);
  revalidateEverywhere();
}

export async function reorderImages(propertyId: string, orderedIds: string[]) {
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("property_images").update({ sort_order: index }).eq("id", id),
    ),
  );

  revalidatePath(`/admin/listings/${propertyId}`);
  revalidateEverywhere();
}
