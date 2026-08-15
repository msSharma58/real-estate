import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { telHref, whatsappHref } from "@/lib/format";
import type { SiteSettings } from "@/lib/queries";

const COLUMNS = [
  {
    title: "Properties",
    links: [
      { href: "/listings?type=land", label: "Land" },
      { href: "/listings?type=house", label: "Houses" },
      { href: "/listings?type=apartment", label: "Apartments" },
      { href: "/listings?type=commercial", label: "Commercial" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/about#contact", label: "Contact" },
      { href: "/listings", label: "All listings" },
      { href: "/admin", label: "Team login" },
    ],
  },
];

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo variant="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              {settings.tagline}. Land, homes and commercial space across Rupandehi
              and the wider Lumbini province — listed honestly, priced clearly.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    {/* `-my-1 py-1` buys 16px of tap area on a 17px-tall link
                        without moving anything: the padding grows the hit box,
                        the negative margin gives the layout back. */}
                    <Link
                      href={link.href}
                      className="-my-1 inline-block py-1 text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white/55">
              Get in touch
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={telHref(settings.phone)}
                  className="flex items-start gap-3 text-white/70 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-brand" />
                  {settings.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-start gap-3 text-white/70 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-brand" />
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
                {settings.address}
              </li>
            </ul>
            <a
              href={whatsappHref(settings.whatsapp, `Hi ${settings.name}, I'd like to know more about a listing.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-strong"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.name}. All rights reserved.
          </p>
          <p>{settings.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
