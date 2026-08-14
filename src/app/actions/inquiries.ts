"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { SITE } from "@/lib/constants";
import { notifyTeamOfInquiry } from "@/lib/notify";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const inquirySchema = z.object({
  propertyId: z.string().uuid().nullish(),
  propertySlug: z.string().nullish(),
  propertyTitle: z.string().nullish(),
  name: z.string().trim().min(2, "Please enter your name").max(120),
  // Nepali mobile numbers are 10 digits; allow country codes and separators.
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(24)
    .regex(/^[\d+\-\s()]+$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").or(z.literal("")).nullish(),
  message: z.string().trim().max(2000).nullish(),
});

export type InquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const parsed = inquirySchema.safeParse({
    propertyId: formData.get("propertyId") || null,
    propertySlug: formData.get("propertySlug") || null,
    propertyTitle: formData.get("propertyTitle") || null,
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const { propertyId, propertyTitle, propertySlug, name, phone, email, message } = parsed.data;

  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message: "The enquiry form isn't connected yet. Please call us instead.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    property_id: propertyId ?? null,
    name,
    phone,
    email: email || null,
    message: message || null,
  });

  if (error) {
    console.error("submitInquiry:", error.message);
    return {
      status: "error",
      message: "Something went wrong saving your enquiry. Please call us instead.",
    };
  }

  // Fire-and-wait: the insert already succeeded, so a failed notification only
  // gets logged rather than shown to the buyer.
  await notifyTeamOfInquiry({
    name,
    phone,
    email,
    message,
    propertyTitle,
    propertyUrl: propertySlug ? `${SITE.url}/properties/${propertySlug}` : null,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");

  return {
    status: "success",
    message: "Thank you — we've got your details and will call you shortly.",
  };
}
