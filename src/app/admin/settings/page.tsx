import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsForm } from "@/components/admin/settings-form";
import { getCurrentProfile, getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const [profile, settings] = await Promise.all([getCurrentProfile(), getSiteSettings()]);

  if (profile?.role !== "admin") {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">Company settings</h1>
        <p className="mt-2 text-[0.9375rem] text-ink-muted">
          The name, phone, email and address shown across the public site.
        </p>
      </header>

      <div className="mt-8">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
