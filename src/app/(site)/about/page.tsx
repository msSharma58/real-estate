import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { InquiryForm } from "@/components/property/inquiry-form";
import { PropertyMap } from "@/components/property/property-map";
import { FadeIn, SectionHeading } from "@/components/site/section";
import { telHref, whatsappHref } from "@/lib/format";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "About & contact",
  description:
    "Prime Real Estate is a Butwal-based property team handling land, houses and commercial space across Rupandehi and Lumbini province. Visit the office or call us directly.",
};

const MILESTONES = [
  {
    value: "5 yrs",
    label: "Working the Butwal market",
    body: "Long enough to know which wards flood, which roads are getting widened, and which plots are worth waiting for.",
  },
  {
    value: "100+",
    label: "Deals closed",
    body: "From two-aana residential plots to highway-facing commercial land. Every one followed up in person.",
  },
  // TODO: confirm the districts you actually cover before launch.
  {
    value: "3",
    label: "Districts covered",
    body: "Rupandehi, Nawalparasi and Kapilvastu — the area we know properly, rather than claiming the whole country.",
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="pt-18">
      <header className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <p className="eyebrow">About us</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-[3.25rem]">
            A small team that knows{" "}
            <span className="text-brand">one market properly</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">
            Prime Real Estate has bought, sold and advised on property in Butwal
            and the surrounding Rupandehi district since 2021. We are not a
            franchise and we do not list everything that comes our way — we list
            what we would be comfortable recommending to family.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {MILESTONES.map((m, i) => (
            <FadeIn key={m.label} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-card p-7">
                <p className="font-display text-4xl font-semibold text-brand">{m.value}</p>
                <p className="mt-3 font-display text-base font-semibold text-ink">{m.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="How we work"
                title="Straight answers, in the order you need them"
              />
              <div className="mt-10 space-y-8">
                {[
                  {
                    step: "01",
                    title: "Tell us the shape of the thing",
                    body: "Budget, area, and what you intend to do with it — build, hold, or run a business. That is usually enough for us to narrow to a handful of options.",
                  },
                  {
                    step: "02",
                    title: "We shortlist, you visit",
                    body: "We arrange site visits in a single trip where possible, so you can compare plots on the same afternoon rather than across three weekends.",
                  },
                  {
                    step: "03",
                    title: "Papers before price talk",
                    body: "Lalpurja, plot number, access rights and any pending disputes get checked before anyone talks numbers. It saves everybody a wasted month.",
                  },
                  {
                    step: "04",
                    title: "Registration handled end to end",
                    body: "We walk the paperwork through the land revenue office with you and stay reachable after the deal closes.",
                  },
                ].map((s, i) => (
                  <FadeIn key={s.step} delay={i * 0.06}>
                    <div className="flex gap-6">
                      <span className="font-display text-sm font-semibold text-brand">
                        {s.step}
                      </span>
                      <div className="border-l border-border pl-6">
                        <h3 className="font-display text-lg font-semibold text-ink">
                          {s.title}
                        </h3>
                        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
                          {s.body}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            <FadeIn delay={0.1}>
              <div className="rounded-2xl border border-border bg-card p-8">
                <h2 className="font-display text-xl font-semibold text-ink">Office</h2>
                <ul className="mt-6 space-y-5 text-[0.9375rem]">
                  <li className="flex items-start gap-4">
                    <MapPin className="mt-0.5 size-4.5 shrink-0 text-brand" />
                    <span className="text-ink-muted">{settings.address}</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Phone className="mt-0.5 size-4.5 shrink-0 text-brand" />
                    <a
                      href={telHref(settings.phone)}
                      className="text-ink transition-colors hover:text-brand"
                    >
                      {settings.phone}
                    </a>
                  </li>
                  <li className="flex items-start gap-4">
                    <MessageCircle className="mt-0.5 size-4.5 shrink-0 text-brand" />
                    <a
                      href={whatsappHref(settings.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink transition-colors hover:text-brand"
                    >
                      WhatsApp
                    </a>
                  </li>
                  <li className="flex items-start gap-4">
                    <Mail className="mt-0.5 size-4.5 shrink-0 text-brand" />
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-ink transition-colors hover:text-brand"
                    >
                      {settings.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-4">
                    <Clock className="mt-0.5 size-4.5 shrink-0 text-brand" />
                    <span className="text-ink-muted">
                      Sunday–Friday, 10:00–18:00
                      <br />
                      Saturday by appointment
                    </span>
                  </li>
                </ul>

                <PropertyMap
                  lat={settings.lat}
                  lng={settings.lng}
                  address={settings.address}
                  zoom={14}
                  className="mt-8"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_28rem] lg:gap-20">
          <SectionHeading
            eyebrow="Contact"
            title="Tell us what you're looking for"
            description="Fill this in and we will call you back — or skip the form entirely and phone the office. Both reach the same people."
          />
          <InquiryForm />
        </div>
      </section>
    </div>
  );
}
