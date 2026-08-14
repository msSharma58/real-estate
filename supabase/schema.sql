-- =============================================================================
-- Prime Real Estate — database schema
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every object is created with IF NOT EXISTS / OR REPLACE.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.property_type as enum ('land', 'house', 'apartment', 'commercial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.property_status as enum ('available', 'pending', 'sold');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_role as enum ('admin', 'agent');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '',
  phone       text,
  role        public.user_role not null default 'agent',
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- properties
-- -----------------------------------------------------------------------------
create table if not exists public.properties (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique,
  type         public.property_type not null,
  price        numeric(14, 2) not null check (price >= 0),
  price_unit   text not null default 'total',          -- 'total' | 'per aana' | 'per ropani' | ...
  area         numeric(12, 2) check (area >= 0),
  area_unit    text not null default 'aana',           -- aana | ropani | dhur | kattha | bigha | sq ft
  address      text not null,
  city         text,
  lat          numeric(10, 7),
  lng          numeric(10, 7),
  status       public.property_status not null default 'available',
  description  text,
  road_access  text,
  featured     boolean not null default false,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists properties_status_idx     on public.properties (status);
create index if not exists properties_type_idx       on public.properties (type);
create index if not exists properties_price_idx      on public.properties (price);
create index if not exists properties_created_at_idx on public.properties (created_at desc);
create index if not exists properties_created_by_idx on public.properties (created_by);

-- Full-text search over title + address + description, used by the search bar.
create index if not exists properties_search_idx on public.properties
  using gin (
    to_tsvector(
      'simple',
      coalesce(title, '') || ' ' || coalesce(address, '') || ' ' ||
      coalesce(city, '') || ' ' || coalesce(description, '')
    )
  );

-- -----------------------------------------------------------------------------
-- property_images
-- -----------------------------------------------------------------------------
create table if not exists public.property_images (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  alt          text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists property_images_property_idx
  on public.property_images (property_id, sort_order);

-- -----------------------------------------------------------------------------
-- inquiries
-- -----------------------------------------------------------------------------
create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid references public.properties (id) on delete set null,
  name         text not null,
  phone        text not null,
  email        text,
  message      text,
  handled      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists inquiries_property_idx   on public.inquiries (property_id);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

-- -----------------------------------------------------------------------------
-- site_settings  (single row — company name, contact details and map pin
-- shown across the public site; editable from the admin panel)
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id         int primary key default 1,
  name       text not null,
  tagline    text,
  phone      text not null,
  whatsapp   text,
  email      text not null,
  address    text not null,
  lat        numeric(10, 7),
  lng        numeric(10, 7),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into public.site_settings (id, name, tagline, phone, whatsapp, email, address, lat, lng)
values (
  1,
  'Prime Real Estate',
  'Your trusted real estate partner',
  '+977 71 123456',
  '9779800000000',
  'hello@primerealestate.com.np',
  'Traffic Chowk, Butwal-11, Rupandehi, Nepal',
  27.7006,
  83.4487
)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists properties_touch_updated_at on public.properties;
create trigger properties_touch_updated_at
  before update on public.properties
  for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- URL-friendly slug for SEO (`/properties/8-aana-land-in-butwal-11-a1b2c3`).
create or replace function public.set_property_slug()
returns trigger language plpgsql set search_path = public as $$
declare base text;
begin
  if new.slug is null or new.slug = '' then
    base := lower(regexp_replace(coalesce(new.title, 'property'), '[^a-zA-Z0-9]+', '-', 'g'));
    base := trim(both '-' from base);
    if base = '' then base := 'property'; end if;
    new.slug := left(base, 60) || '-' || left(replace(new.id::text, '-', ''), 6);
  end if;
  return new;
end $$;

drop trigger if exists properties_set_slug on public.properties;
create trigger properties_set_slug
  before insert on public.properties
  for each row execute function public.set_property_slug();

-- Create a profile whenever a team member is invited. The very first account
-- becomes the admin so the panel is reachable straight after setup.
--
-- The role expression MUST carry an explicit ::public.user_role cast. Postgres
-- resolves a CASE over bare string literals to `text`, and will not implicitly
-- assign text to an enum column — without the cast every signup fails with
-- SQLSTATE 42804 and Supabase reports a generic 500.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    (case
       when (select count(*) from public.profiles) = 0 then 'admin'
       else 'agent'
     end)::public.user_role
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- RLS helpers
-- SECURITY DEFINER so policies can read profiles without recursing into RLS.
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.can_edit_property(p_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.properties
    where id = p_id and created_by = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- Function privileges
--
-- These are SECURITY DEFINER, so they must not be freely callable over
-- /rest/v1/rpc. `handle_new_user` is a trigger (triggers don't need caller
-- EXECUTE), so nobody gets it. `is_admin` / `can_edit_property` are referenced
-- by RLS policy expressions, which Postgres evaluates as the *querying* role —
-- so `authenticated` must keep EXECUTE or every policy using them fails. No
-- anon policy references them, so anon is revoked.
-- -----------------------------------------------------------------------------
revoke all on function public.handle_new_user() from public, anon, authenticated;

revoke all on function public.is_admin()              from public, anon;
revoke all on function public.can_edit_property(uuid) from public, anon;
grant execute on function public.is_admin()              to authenticated;
grant execute on function public.can_edit_property(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.properties      enable row level security;
alter table public.property_images enable row level security;
alter table public.inquiries       enable row level security;
alter table public.site_settings   enable row level security;

-- profiles: team-only. Buyers never read staff phone numbers.
drop policy if exists "profiles readable by team" on public.profiles;
create policy "profiles readable by team" on public.profiles
  for select to authenticated using (true);

drop policy if exists "own profile is editable" on public.profiles;
create policy "own profile is editable" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles" on public.profiles
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- properties: world-readable (the sold/pending filter is applied by the app, so
-- the public "show sold" toggle and SEO indexing both keep working).
drop policy if exists "properties are public" on public.properties;
create policy "properties are public" on public.properties
  for select to anon, authenticated using (true);

drop policy if exists "team creates properties" on public.properties;
create policy "team creates properties" on public.properties
  for insert to authenticated with check (created_by = auth.uid() or public.is_admin());

drop policy if exists "owner or admin updates properties" on public.properties;
create policy "owner or admin updates properties" on public.properties
  for update to authenticated
  using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

drop policy if exists "owner or admin deletes properties" on public.properties;
create policy "owner or admin deletes properties" on public.properties
  for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

-- property_images: public read, write follows the parent property.
drop policy if exists "property images are public" on public.property_images;
create policy "property images are public" on public.property_images
  for select to anon, authenticated using (true);

drop policy if exists "team manages property images" on public.property_images;
create policy "team manages property images" on public.property_images
  for all to authenticated
  using (public.can_edit_property(property_id))
  with check (public.can_edit_property(property_id));

-- inquiries: anyone may submit, only the listing owner or an admin may read.
drop policy if exists "anyone can submit an inquiry" on public.inquiries;
create policy "anyone can submit an inquiry" on public.inquiries
  for insert to anon, authenticated with check (true);

drop policy if exists "team reads relevant inquiries" on public.inquiries;
create policy "team reads relevant inquiries" on public.inquiries
  for select to authenticated
  using (public.is_admin() or public.can_edit_property(property_id));

drop policy if exists "team updates relevant inquiries" on public.inquiries;
create policy "team updates relevant inquiries" on public.inquiries
  for update to authenticated
  using (public.is_admin() or public.can_edit_property(property_id))
  with check (public.is_admin() or public.can_edit_property(property_id));

drop policy if exists "admins delete inquiries" on public.inquiries;
create policy "admins delete inquiries" on public.inquiries
  for delete to authenticated using (public.is_admin());

-- site_settings: world-readable (navbar/footer/about need it on every page
-- render), only admins may change the company's contact details.
drop policy if exists "site settings are public" on public.site_settings;
create policy "site settings are public" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "admins manage site settings" on public.site_settings;
create policy "admins manage site settings" on public.site_settings
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Storage — property photos
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = true;

drop policy if exists "property images are publicly readable" on storage.objects;
create policy "property images are publicly readable" on storage.objects
  for select to anon, authenticated using (bucket_id = 'property-images');

drop policy if exists "team uploads property images" on storage.objects;
create policy "team uploads property images" on storage.objects
  for insert to authenticated with check (bucket_id = 'property-images');

drop policy if exists "team updates property images" on storage.objects;
create policy "team updates property images" on storage.objects
  for update to authenticated using (bucket_id = 'property-images');

drop policy if exists "team deletes property images" on storage.objects;
create policy "team deletes property images" on storage.objects
  for delete to authenticated using (bucket_id = 'property-images');
