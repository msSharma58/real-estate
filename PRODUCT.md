# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — local buyers in Butwal / Rupandehi.** In or near the district, able to
visit a plot the same week. They arrive by phone or WhatsApp as often as by
browser, frequently on mobile, and the real conversion step is a site visit, not
a form submission.

**Primary — Nepali diaspora / NRN buyers abroad.** Buying land back home from the
Gulf, Australia, the US and elsewhere. They cannot visit, so everything they can
verify remotely — full photo sets, complete price and plot detail, a named person
to speak to — carries the weight a site visit would. Time zones and messaging
apps, not office hours, govern how they get in touch.

**Primary — Kathmandu and out-of-district investors.** Treating Butwal property as
an investment. They evaluate road access, growth corridors, price per aana and
resale prospects rather than livability.

**Internal — the Prime Real Estate team.** Two roles, enforced in Postgres
row-level security rather than only in the UI:

- **Admin:** full listing CRUD, all enquiries, team management.
- **Agent:** creates listings, edits and deletes only their own, sees enquiries
  only on their own listings.

Agents work from the admin panel to publish listings and follow up on enquiries;
photo upload from a phone is a normal part of that job.

## Product Purpose

A public property listing site plus a login-gated admin panel for a Butwal-based
agency dealing in land, houses, apartments and commercial space across Rupandehi
and the wider Lumbini province.

The public site exists so a buyer can find a suitable property, understand it
fully without contacting anyone, and then reach the agent handling it. The admin
panel exists so the team can keep inventory current without a developer.

Success is a qualified enquiry that reaches the right agent — a buyer who already
knows the price, the area and the plot before the first call.

## Positioning

A small local team that knows one market properly, rather than a franchise
listing everything that comes its way. Two things a neighbouring agency could not
truthfully copy without doing the same work:

- **Depth in a single district** — knowing which wards flood, which roads are
  being widened, and which plots are worth waiting for.
- **Full transparency on the listing itself** — every price stated in full, plot
  detail and area published, and a direct line to the agent handling that
  specific property, rather than a central enquiry desk.

## Operating Context

- **Nepali property vocabulary is the working language of the domain.** Area in
  aana, ropani, dhur, kattha, bigha (alongside sq ft / sq m); prices in NPR
  formatted in lakh and crore; ownership evidenced by the lalpurja. These are
  facts about the market, not decoration.
- **Prices carry a unit.** Land is quoted per aana, per ropani, per dhur, per
  kattha, per bigha or per sq ft as well as as a total; the unit is part of the
  price.
- **Enquiry follow-up happens off-site** — phone, WhatsApp, and in person.
  Notification is delivered over two independent optional channels (email via
  Resend, and a JSON webhook aimed at a WhatsApp relay, Slack or n8n). The
  enquiry is persisted before either fires, so a failed notification never loses
  a lead.
- **Sold listings persist.** They are hidden from public listings by default but
  reachable through an "include sold" filter, because recent sales are evidence
  of activity. The admin table always shows everything.
- **Filtering runs through URL search params**, so a filtered result set is
  shareable and indexable.
- **Working method (real, roughly stated).** The team batches site visits into a
  single trip where possible, checks papers — lalpurja, plot number, access
  rights, pending disputes — before price negotiation, and stays with the buyer
  through registration at the land revenue office. The practice is genuine; the
  exact wording currently in the code is approximate and any published promise
  needs the team's sign-off before launch.

## Capabilities and Constraints

**Built and working**

- Public: home with search, filterable listings, property detail with gallery,
  map and enquiry form, about/contact.
- Admin at `/admin`: dashboard, listing CRUD with drag-to-reorder photo upload,
  enquiry inbox. Login-gated.
- Photos are resized to 1920px on the long edge and converted to WebP in the
  browser before upload.
- Maps use the Google Maps Embed with an OpenStreetMap fallback.
- SEO: per-listing metadata and OG images, `RealEstateListing` JSON-LD, a
  generated sitemap covering every property, and a robots file excluding
  `/admin` and `/login`.

**Constraints**

- Next.js 16 App Router with React 19 on Turbopack; Tailwind v4 + shadcn/ui;
  Framer Motion for reveals; Supabase for database, auth and storage; deployed to
  Vercel. This version of Next.js differs from common training data — consult
  `node_modules/next/dist/docs/` before writing framework code.
- Every `process.env` read uses `||`, not `??`. An env var that is present but
  empty must fall back; `??` would pass an empty string to `next/image`, which
  throws and takes hydration down with it.
- Framer Motion reveals are driven by requestAnimationFrame, which browsers
  freeze while `document.hidden` is true. Headless and offscreen preview panes
  therefore show elements in their pre-animation state — that is expected, not a
  bug to fix.
- Role permissions are enforced by row-level security in Postgres. UI-only
  gating is not sufficient and must not be treated as the boundary.

**Language:** English only, confirmed. Nepali domain terms (aana, ropani,
lalpurja) stay as vocabulary inside English copy. Devanagari-first or bilingual
delivery is not in scope.

**Undecided / open**

- The business is real but this build is still exploratory — a proposal rather
  than a launched site. Placeholders stay until the team supplies real values.
- Districts genuinely covered are unconfirmed. The about page no longer names
  any: the "Rupandehi, Nawalparasi and Kapilvastu" claim and its TODO were
  removed rather than left to ship. The page now says only Butwal and the
  surrounding Rupandehi district, which the team has confirmed.
- Remote buyers are a primary audience but **no distinct remote service exists
  today** — no video walkthrough offer, no document-verification service, no
  representation for an overseas buyer's local family member. Future work must
  not imply any of these.

## Brand Commitments

- Name: **Prime Real Estate**. Tagline in use: "Your trusted real estate
  partner."
- No other identity constraint, reference or voice commitment has been made
  binding by the team.

## Evidence on Hand

**Real and available**

- Genuine office contact details — phone, WhatsApp, email, address and map pin —
  ready to replace the placeholders in
  [constants.ts](src/lib/constants.ts) (`SITE.phone`, `SITE.whatsapp`,
  `SITE.email`, `SITE.address`, `SITE.lat`, `SITE.lng`).
- Own photography of actual properties, enough for the site to lead with real
  imagery instead of stock.
- Real inventory — actual listings with prices, plot numbers and areas — beyond
  the ten seeded samples currently in the database.

**Placeholder, and not to be treated as fact**

- The hero photograph (`NEXT_PUBLIC_HERO_IMAGE`) is a stock Unsplash image, and
  it shows a modern villa that does not represent the actual inventory. The team
  has real property photography; this should be replaced before launch.
- Contact details in [constants.ts](src/lib/constants.ts) are still placeholders.
  They are only fallbacks — `getSiteSettings()` reads the live values from the
  `site_settings` table, so the team can set the real ones from admin settings
  without a deploy.

**Removed rather than shipped** (2026-08-14)

The track-record numbers written by the build — "5 yrs", "100+ deals", "3
districts", "since 2021", and "since the highway corridor opened up" — were
never supplied by the team and have been taken out of the about page and
homepage. The homepage claim that *every* listing carries a map pin was also
untrue by the site's own admission, since `PropertyMap` has a "no map pin set"
fallback state; it now describes what happens in both cases.

Do not reinstate any of these. If the team wants a track record on the page,
they must supply the real figures.

**Does not exist — must never be fabricated**

- No testimonials, client quotes, case studies, press coverage, awards,
  licensing or registration credentials, named team members, or partner logos.
- No verified transaction volume, years in business, or market-share figure.

## Product Principles

1. **A listing should answer the buyer's questions before the call.** Full price
   with its unit, real area in the unit the market uses, plot detail and complete
   photography. Withholding detail to force an enquiry is the opposite of the
   positioning.
2. **Design for the buyer who cannot visit.** Remote and out-of-district buyers
   are a primary audience, and everything verifiable on screen carries the weight
   a site visit would carry for a local buyer.
3. **Speak the market's language.** Aana and ropani, lakh and crore, lalpurja —
   local vocabulary used correctly is the product's credibility, not a
   localisation detail.
4. **Claim only what the team can stand behind.** Local depth is the honest
   advantage; invented proof would undo it. Where evidence does not exist, the
   design earns trust through completeness instead.
5. **The team must be able to run this alone.** Every content path a working
   agency needs — publish, edit, photograph, respond — belongs in the admin panel,
   usable from a phone.
6. **Enquiries are handed to a person, not a queue.** The route from a listing to
   the agent handling it stays short and direct.

## Accessibility & Inclusion

No product-specific standard has been established by the team. Two audience facts
carry design weight regardless: mobile-first usage is the norm for local buyers,
and diaspora buyers reach the site across time zones and network conditions that
make weight and offline-tolerant reading matter.
