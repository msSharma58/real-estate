import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminNav } from "@/components/admin/admin-nav";
import { getCurrentProfile, getDashboardStats } from "@/lib/queries";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Prime Admin" },
  robots: { index: false, follow: false },
};

/** Admin pages are per-user and must never be cached or prerendered. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const [profile, stats] = await Promise.all([getCurrentProfile(), getDashboardStats()]);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-sidebar lg:block">
        <AdminNav profile={profile} newInquiries={stats.newInquiries} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <AdminMobileNav profile={profile} newInquiries={stats.newInquiries} />

        <div className="hidden justify-end px-8 pt-6 lg:flex">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-brand"
          >
            View public site
            <ExternalLink className="size-3.5" />
          </Link>
        </div>

        {/* Bottom padding clears the fixed phone tab bar. */}
        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
