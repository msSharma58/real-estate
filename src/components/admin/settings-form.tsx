"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updateSiteSettings, type SettingsFormState } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SiteSettings } from "@/lib/queries";

const INITIAL: SettingsFormState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-6 text-white hover:bg-ink/90"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Saving…
        </>
      ) : (
        <>
          <Save className="size-4" /> Save changes
        </>
      )}
    </Button>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(updateSiteSettings, INITIAL);

  useEffect(() => {
    if (state.status === "error" && state.message && !state.fieldErrors) {
      toast.error(state.message);
    }
    if (state.status === "idle" && state.message === "Saved") {
      toast.success("Settings saved");
    }
  }, [state]);

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="space-y-8">
      <Card title="Company">
        <div className="space-y-5">
          <FieldWrap label="Company name" htmlFor="name" error={err("name")}>
            <Input
              id="name"
              name="name"
              defaultValue={settings.name}
              required
              aria-invalid={Boolean(err("name"))}
            />
          </FieldWrap>

          <FieldWrap
            label="Tagline"
            htmlFor="tagline"
            error={err("tagline")}
            hint="Shown under the name in the footer and page titles."
          >
            <Input id="tagline" name="tagline" defaultValue={settings.tagline} />
          </FieldWrap>
        </div>
      </Card>

      <Card title="Contact details" subtitle="Shown in the navbar, footer, about page and property pages.">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrap
              label="Phone"
              htmlFor="phone"
              error={err("phone")}
              hint="Used for the “Call” buttons across the site."
            >
              <Input
                id="phone"
                name="phone"
                defaultValue={settings.phone}
                placeholder="+977 71 123456"
                required
                aria-invalid={Boolean(err("phone"))}
              />
            </FieldWrap>

            <FieldWrap
              label="WhatsApp number"
              htmlFor="whatsapp"
              error={err("whatsapp")}
              hint="Digits only, with country code — e.g. 9779800000000."
            >
              <Input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} placeholder="9779800000000" />
            </FieldWrap>
          </div>

          <FieldWrap label="Email" htmlFor="email" error={err("email")}>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={settings.email}
              required
              aria-invalid={Boolean(err("email"))}
            />
          </FieldWrap>

          <FieldWrap label="Office address" htmlFor="address" error={err("address")}>
            <Input
              id="address"
              name="address"
              defaultValue={settings.address}
              required
              aria-invalid={Boolean(err("address"))}
            />
          </FieldWrap>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrap label="Latitude" htmlFor="lat" error={err("lat")}>
              <Input id="lat" name="lat" inputMode="decimal" defaultValue={settings.lat} />
            </FieldWrap>

            <FieldWrap label="Longitude" htmlFor="lng" error={err("lng")}>
              <Input id="lng" name="lng" inputMode="decimal" defaultValue={settings.lng} />
            </FieldWrap>
          </div>

          <p className="text-xs leading-relaxed text-ink-muted">
            To get the coordinates: open Google Maps, long-press the office, and copy
            the two numbers it shows. This is the pin shown on the about page map.
          </p>
        </div>
      </Card>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/8 px-4 py-3.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-end border-t border-border pt-6">
        <SaveButton />
      </div>
    </form>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
      <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FieldWrap({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}
