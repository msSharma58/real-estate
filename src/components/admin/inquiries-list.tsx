"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, MessageCircle, Phone, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { deleteInquiry, setInquiryHandled } from "@/app/actions/inquiries-admin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatRelative, telHref, whatsappHref } from "@/lib/format";
import type { InquiryWithProperty } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function InquiriesList({ inquiries }: { inquiries: InquiryWithProperty[] }) {
  const [tab, setTab] = useState<"new" | "handled" | "all">("new");
  const [isPending, startTransition] = useTransition();

  const rows = useMemo(() => {
    if (tab === "all") return inquiries;
    return inquiries.filter((i) => (tab === "new" ? !i.handled : i.handled));
  }, [inquiries, tab]);

  const newCount = inquiries.filter((i) => !i.handled).length;

  function mark(id: string, handled: boolean) {
    startTransition(async () => {
      try {
        await setInquiryHandled(id, handled);
        toast.success(handled ? "Marked as followed up" : "Moved back to new");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      try {
        await deleteInquiry(id);
        toast.success("Enquiry deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete");
      }
    });
  }

  return (
    <>
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="new">
            New
            {newCount > 0 && (
              <span className="ml-2 grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[0.6875rem] font-semibold text-brand-foreground">
                {newCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="handled">Followed up</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className={cn("mt-6 space-y-3 transition-opacity", isPending && "opacity-60")}>
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center text-sm text-ink-muted">
            {tab === "new"
              ? "Nothing waiting — every enquiry has been followed up."
              : "Nothing here."}
          </p>
        ) : (
          rows.map((inq) => (
            <article
              key={inq.id}
              className={cn(
                "rounded-2xl border bg-card p-5 sm:p-6",
                inq.handled ? "border-border" : "border-brand-soft",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                    {inq.name}
                    {!inq.handled && <span className="size-1.5 rounded-full bg-brand" />}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    <a
                      href={telHref(inq.phone)}
                      className="inline-flex items-center gap-1.5 font-medium text-ink transition-colors hover:text-brand"
                    >
                      <Phone className="size-3.5" />
                      {inq.phone}
                    </a>
                    <a
                      href={whatsappHref(
                        inq.phone,
                        `Hello ${inq.name}, this is Prime Real Estate replying about your enquiry.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-ink-muted transition-colors hover:text-brand"
                    >
                      <MessageCircle className="size-3.5" />
                      WhatsApp
                    </a>
                    {inq.email && (
                      <a
                        href={`mailto:${inq.email}`}
                        className="text-ink-muted transition-colors hover:text-brand"
                      >
                        {inq.email}
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-ink-muted">
                  <p>{formatRelative(inq.created_at)}</p>
                  <p className="mt-0.5">{formatDate(inq.created_at)}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-ink-muted">
                {inq.property ? (
                  <>
                    Enquiring about{" "}
                    <Link
                      href={`/admin/listings/${inq.property.id}`}
                      className="font-medium text-ink underline-offset-2 hover:text-brand hover:underline"
                    >
                      {inq.property.title}
                    </Link>
                  </>
                ) : (
                  "General enquiry from the contact page"
                )}
              </p>

              {inq.message && (
                <blockquote className="mt-4 border-l-2 border-brand-soft pl-4 text-[0.9375rem] leading-relaxed text-ink">
                  {inq.message}
                </blockquote>
              )}

              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                {inq.handled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => mark(inq.id, false)}
                  >
                    <Undo2 className="size-3.5" /> Move back to new
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="rounded-full bg-ink text-white hover:bg-ink/90"
                    onClick={() => mark(inq.id, true)}
                  >
                    <Check className="size-3.5" /> Mark followed up
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-ink-muted hover:text-destructive"
                  onClick={() => remove(inq.id)}
                >
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
