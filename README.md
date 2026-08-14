# Prime Real Estate

Property listing site for **Prime Real Estate** — land, houses, apartments and
commercial space across Butwal, Rupandehi and Lumbini province.

- **Public site**: homepage with search, filterable listings, property detail
  pages with gallery + map + enquiry form, about/contact.
- **Admin panel** (`/admin`, login-gated): dashboard, listing CRUD with photo
  upload, buyer enquiries.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animation | Framer Motion |
| Database, auth, storage | Supabase |
| Maps | Google Maps Embed, falling back to OpenStreetMap |
| Deployment | Vercel |

## Setup

### 1. Install

```bash
npm install
```

### 2. Create the Supabase project

In the [Supabase dashboard](https://supabase.com/dashboard), create a project,
then open **SQL Editor → New query**, paste the contents of
[`supabase/schema.sql`](supabase/schema.sql) and run it. That creates the
tables, enums, triggers, row-level security policies and the public
`property-images` storage bucket. It is safe to re-run.

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
**Project Settings → API**. Everything else is optional — see the comments in
`.env.example`.

> **Already done for this project.** A Supabase project (`prime-realestate`,
> ap-south-1) exists, the schema is applied, `.env.local` is filled in, and ten
> sample listings are seeded. Steps 2–3 only matter if you rebuild from scratch.

### 4. Create the first team account

Supabase dashboard → **Authentication → Users → Add user**. Give it an email and
password and tick "Auto Confirm User".

The `handle_new_user` trigger creates the matching profile row automatically and
**makes the first account an admin**; every account after that starts as an
agent. To promote someone later:

```sql
update public.profiles set role = 'admin' where id = '<user-uuid>';
```

### 5. Run

```bash
npm run dev
```

Public site at `http://localhost:3000`, admin at `http://localhost:3000/admin`.

## Roles

| | Admin | Agent |
|---|---|---|
| Add listings | ✅ | ✅ |
| Edit / delete listings | any | own only |
| View enquiries | all | on own listings |
| Manage team members | ✅ | ❌ |

These are enforced by Postgres row-level security, not just the UI — an agent
cannot read another agent's enquiries even through a direct API call.

## Key behaviours

- **Sold listings** stay in the database but are hidden from public listings.
  The listings page has an "Include sold properties" filter for buyers browsing
  recent activity, and the admin table always shows everything.
- **Photo uploads** are resized to 1920px on the long edge and converted to
  WebP in the browser before upload, so a 6 MB phone photo lands around 400 KB.
  Drag the rows to reorder; the first photo is the listing cover.
- **Filtering** runs through URL search params with `router.replace`, so results
  are shareable and indexable while never doing a full page reload.
- **Enquiry notifications** go out over two independent optional channels: email
  via Resend, and a JSON webhook (point it at a WhatsApp Business relay, Slack,
  n8n, whatever). A failed notification never loses the enquiry — it is already
  saved before either fires.
- **SEO**: per-listing metadata and OG images, `RealEstateListing` JSON-LD,
  generated `sitemap.xml` covering every property, and `robots.txt` that
  excludes `/admin` and `/login`.

## Notes

**Animations need a visible tab.** Framer Motion drives reveals with
requestAnimationFrame, which browsers freeze while `document.hidden` is true.
That is normal, but it means headless/offscreen preview panes show elements at
their pre-animation state. Pinned to `framer-motion@^12`, which is what the
current docs describe.

**Empty env vars are not missing env vars.** Every `process.env` read uses `||`,
not `??` — `NEXT_PUBLIC_HERO_IMAGE=` in a `.env` file is an empty string, and
`??` would pass it straight through to `next/image`, which throws on an empty
`src` and takes hydration down with it.

## Content to replace before launch

These are placeholders in [`src/lib/constants.ts`](src/lib/constants.ts) and
need the real values:

- `SITE.phone`, `SITE.whatsapp`, `SITE.email`, `SITE.address`
- `SITE.lat` / `SITE.lng` — the office pin used on the about page
- The hero photograph (`NEXT_PUBLIC_HERO_IMAGE`) currently points at a stock
  Unsplash image. Swap it for a real property photo.
- The company copy on the homepage and about page — the numbers ("12 yrs",
  "400+ deals") are illustrative.

## Deploying to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add the same environment variables from `.env.local`, setting
   `NEXT_PUBLIC_SITE_URL` to the production domain.
4. In Supabase → **Authentication → URL Configuration**, add the production
   domain to the allowed redirect URLs.

## Project layout

```
src/
  app/
    (site)/          public pages — home, listings, property detail, about
    admin/           login-gated panel
    actions/         server actions (auth, properties, inquiries)
    login/
  components/
    admin/           property form, image uploader, listings table, enquiries
    property/        card, grid, gallery, filters, map, enquiry form
    site/            nav, footer, hero, logo, section primitives
    ui/              shadcn primitives
  lib/
    supabase/        browser / server / proxy clients + env resolution
    queries.ts       all read paths
    format.ts        NPR lakh–crore prices, Nepali area units
supabase/
  schema.sql         tables, RLS, storage bucket
```
