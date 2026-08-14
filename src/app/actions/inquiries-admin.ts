"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function setInquiryHandled(id: string, handled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").update({ handled }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
}
