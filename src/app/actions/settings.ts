"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined) return null;
    const s = typeof v === "number" ? String(v) : v.trim();
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  });

const settingsSchema = z.object({
  name: z.string().trim().min(2, "Enter a company name").max(120),
  tagline: z.string().trim().max(160).optional().nullable(),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(24),
  whatsapp: z.string().trim().max(24).optional().nullable(),
  email: z.string().trim().email("Enter a valid email").max(160),
  address: z.string().trim().min(3, "Enter the office address").max(300),
  lat: optionalNumber,
  lng: optionalNumber,
});

export type SettingsFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

function readForm(formData: FormData) {
  return {
    name: formData.get("name") ?? "",
    tagline: formData.get("tagline") ?? "",
    phone: formData.get("phone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    email: formData.get("email") ?? "",
    address: formData.get("address") ?? "",
    lat: formData.get("lat") ?? "",
    lng: formData.get("lng") ?? "",
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

export async function updateSiteSettings(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Supabase isn't connected yet." };
  }

  const parsed = settingsSchema.safeParse(readForm(formData));
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { status: "error", message: "Only admins can update company settings." };
  }

  const { error } = await supabase
    .from("site_settings")
    .update({
      ...parsed.data,
      tagline: parsed.data.tagline || null,
      whatsapp: parsed.data.whatsapp || null,
    })
    .eq("id", 1);

  if (error) {
    console.error("updateSiteSettings:", error.message);
    return { status: "error", message: error.message };
  }

  // Contact details render in the navbar/footer on every route, so bust the
  // whole tree rather than tracking down each page individually.
  revalidatePath("/", "layout");
  return { status: "idle", message: "Saved" };
}
