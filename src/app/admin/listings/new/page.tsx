import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PropertyForm } from "@/components/admin/property-form";

export const metadata: Metadata = { title: "New listing" };

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        All listings
      </Link>

      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">New listing</h1>
      <p className="mt-2 text-[0.9375rem] text-ink-muted">
        Fill in what you know now — you can add photos and coordinates later.
      </p>

      <div className="mt-8">
        <PropertyForm />
      </div>
    </div>
  );
}
