import Link from "next/link";
import { ArrowRight, Building2, Home, Landmark, MapPinned, Phone, ShieldCheck, Trees } from "lucide-react";

import { EmptyState, PropertyGrid } from "@/components/property/property-grid";
import { Hero } from "@/components/site/hero";
import { FadeIn, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { telHref, whatsappHref } from "@/lib/format";
import { getFeaturedProperties, getSiteSettings } from "@/lib/queries";

export const revalidate = 300;

const CATEGORIES = [
  {
    href: "/listings?type=land",
    icon: Trees,
    label: "Land",
    blurb: "Plotted, road-touched and agricultural land by the aana, ropani or kattha.",
  },
  {
    href: "/listings?type=house",
    icon: Home,
    label: "Houses",
    blurb: "Ready-to-move family homes, from compact town houses to bungalows.",
  },
  {
    href: "/listings?type=apartment",
    icon: Building2,
    label: "Apartments",
    blurb: "Serviced flats in managed buildings with parking and lift access.",
  },
  {
    href: "/listings?type=commercial",
    icon: Landmark,
    label: "Commercial",
    blurb: "Shutters, office floors and highway-facing plots for business use.",
  },
];

const ASSURANCES = [
  {
    icon: ShieldCheck,
    title: "Papers checked first",
    body: "We read the lalpurja, confirm the plot number and check for disputes before a listing goes live. If something is unclear, it does not get published.",
  },
  {
    icon: MapPinned,
    title: "Pinned where it actually is",
    body: "Every listing carries a map pin we placed on site — not an approximate town centre marker. You will find the plot without calling for directions.",
  },
  {
    icon: Phone,
    title: "One person, start to finish",
    body: "The agent who lists a property is the one who shows it and negotiates it. No handovers, no repeating yourself to a call centre.",
  },
];

export default async function HomePage() {
  const [featured, settings] = await Promise.all([
    getFeaturedProperties(6),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero />

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <SectionHeading
          eyebrow="Available now"
          title="Recently listed"
          description="A working selection of what is on our books this week. Sold properties drop off automatically."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/listings">
                All listings <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />

        <div className="mt-12">
          <PropertyGrid
            properties={featured}
            empty={
              <EmptyState
                title="No listings published yet"
                description="New properties are added most weeks. Call the office and we'll tell you what is available right now, listed or not."
                action={
                  <Button asChild className="rounded-full bg-brand text-brand-foreground hover:bg-brand-strong">
                    <a href={telHref(settings.phone)}>Call {settings.phone}</a>
                  </Button>
                }
              />
            }
          />
        </div>
      </section>

      {/* Browse by type */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <SectionHeading
            eyebrow="Browse by type"
            title="Start with what you're looking for"
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <FadeIn key={c.href} delay={i * 0.06}>
                <Link
                  href={c.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-soft hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.4)]"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-tint text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
                    <c.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink">{c.label}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{c.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors group-hover:text-brand">
                    View listings
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About / assurances */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <SectionHeading
            eyebrow="Why Prime"
            title={
              <>
                A property listing is a promise.
                <br />
                <span className="text-brand">We keep ours short.</span>
              </>
            }
            description="Prime Real Estate has worked the Butwal and Rupandehi market since the highway corridor opened up. We list fewer properties than we could, because every one is checked before it goes up."
          />

          <div className="space-y-8">
            {ASSURANCES.map((a, i) => (
              <FadeIn key={a.title} delay={i * 0.08}>
                <div className="flex gap-5">
                  <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-brand">
                    <a.icon className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{a.title}</h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">{a.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Contact band */}
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <FadeIn className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand">
                Talk to us
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-white sm:text-[2.5rem]">
                Looking for something you haven&rsquo;t found here?
              </h2>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-white/60">
                Plenty of what we handle never makes it onto the site. Tell us the
                area, the budget and what you plan to build — we will call back with
                what is actually available.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-brand px-7 text-brand-foreground hover:bg-brand-strong"
              >
                <a href={telHref(settings.phone)}>
                  <Phone className="size-4" /> {settings.phone}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/25 bg-transparent px-7 text-white hover:bg-white hover:text-ink"
              >
                <a
                  href={whatsappHref(settings.whatsapp, `Hi ${settings.name}, I'm looking for a property.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp us
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
