import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_STYLES } from "@/lib/constants";
import { formatPrice, formatRelative } from "@/lib/format";
import { getDashboardStats, getInquiries, getManagedProperties } from "@/lib/queries";
import { cn } from "@/lib/utils";

export default async function AdminDashboard() {
  const [stats, inquiries, properties] = await Promise.all([
    getDashboardStats(),
    getInquiries(5),
    getManagedProperties(),
  ]);

  const recent = properties.slice(0, 5);

  const cards = [
    { label: "Total listings", value: stats.total, icon: Building2, tone: "neutral" as const },
    { label: "Available", value: stats.available, icon: CheckCircle2, tone: "good" as const },
    { label: "Under offer", value: stats.pending, icon: Clock, tone: "warn" as const },
    {
      label: "New enquiries",
      value: stats.newInquiries,
      icon: MessageSquare,
      tone: stats.newInquiries > 0 ? ("brand" as const) : ("neutral" as const),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-2 text-[0.9375rem] text-ink-muted">
            {stats.total === 0
              ? "No listings yet — add the first one to get started."
              : `${stats.available} of ${stats.total} listings are live on the public site.`}
          </p>
        </div>
        <Button asChild className="rounded-full bg-ink text-white hover:bg-ink/90">
          <Link href="/admin/listings/new">
            <Plus className="size-4" /> New listing
          </Link>
        </Button>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                {card.label}
              </p>
              <card.icon
                className={cn(
                  "size-4",
                  card.tone === "brand" ? "text-brand" : "text-ink-muted/60",
                )}
              />
            </div>
            <p
              className={cn(
                "mt-4 font-display text-4xl font-semibold leading-none",
                card.tone === "brand" ? "text-brand" : "text-ink",
              )}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <h2 className="font-display text-base font-semibold text-ink">Recent listings</h2>
            <Link
              href="/admin/listings"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand-strong"
            >
              Manage <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-muted">
              Nothing listed yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/listings/${p.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                      <p className="mt-1 truncate text-xs text-ink-muted">{p.address}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-ink">{formatPrice(p.price)}</p>
                      <Badge
                        variant="outline"
                        className={cn("mt-1 border-0 text-[0.625rem] uppercase", STATUS_STYLES[p.status])}
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <h2 className="font-display text-base font-semibold text-ink">Recent enquiries</h2>
            <Link
              href="/admin/inquiries"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand-strong"
            >
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-muted">
              No enquiries yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {inquiries.map((inq) => (
                <li key={inq.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {inq.name}
                        {!inq.handled && (
                          <span className="ml-2 inline-block size-1.5 rounded-full bg-brand align-middle" />
                        )}
                      </p>
                      <a
                        href={`tel:${inq.phone}`}
                        className="mt-0.5 block text-xs text-brand hover:underline"
                      >
                        {inq.phone}
                      </a>
                      <p className="mt-1.5 truncate text-xs text-ink-muted">
                        {inq.property?.title ?? "General enquiry"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-muted">
                      {formatRelative(inq.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
