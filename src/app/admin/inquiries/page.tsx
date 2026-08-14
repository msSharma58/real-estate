import type { Metadata } from "next";

import { InquiriesList } from "@/components/admin/inquiries-list";
import { getInquiries } from "@/lib/queries";

export const metadata: Metadata = { title: "Enquiries" };

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">Enquiries</h1>
        <p className="mt-2 text-[0.9375rem] text-ink-muted">
          Buyers who left their details through the site. Agents see enquiries on
          their own listings; admins see everything.
        </p>
      </header>

      <div className="mt-8">
        <InquiriesList inquiries={inquiries} />
      </div>
    </div>
  );
}
