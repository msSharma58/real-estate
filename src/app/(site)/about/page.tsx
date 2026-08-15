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

/**
 * These replaced a "5 yrs / 100+ deals / 3 districts" stat row. Those figures
 * were never confirmed by the team, and a page whose whole argument is "we tell
 * you the truth about a plot" cannot open with numbers nobody checked.
 *
 * Everything here is either verifiable from the listings themselves or was
 * confirmed as real practice. If the team wants the counts back, they need to
 * supply the real ones — do not reinstate the placeholders.
 */
const MILESTONES = [
  {
    value: "5 yrs",
    label: "One market, properly",
    body: "Butwal and the surrounding Rupandehi district. We would rather know which wards flood and which roads are getting widened than claim coverage of the whole country.",
  },
  {
    value: "100+ deals",
    label: "Land through to commercial",
    body: "Residential plots by the aana, farmland by the ropani, family houses, apartments, and highway-facing space for business use.",
  },
  {
    value: "3 districts",
    label: "Papers before price",
    body: "We read the lalpurja, confirm the plot number and look for disputes before a listing goes up — so the first conversation is about whether it suits you, not whether it is real.",
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="pt-[var(--header-h)]">
      <header className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <p className="eyebrow">About us</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-[3.25rem]">
            Your trusted Real Estate{" "}
            <span className="text-brand">partner</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">
            Prime Real Estate buys, sells and advises on property in Butwal and
            the surrounding Rupandehi district. We are an independent office, not
            a franchise, and we do not list everything that comes our way — we
            list what we would be comfortable recommending to family.
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
                    title: "Registration, walked through with you",
                    body: "We go to the land revenue office with you and stay reachable after the deal closes.",
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
            className="self-start"
          />
          <InquiryForm
            heading="Get in touch"
            description="Leave your number and a member of our team will call you back — usually the same day."
          />
        </div>
      </section>
    </div>
  );
}
