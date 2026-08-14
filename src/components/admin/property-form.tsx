"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import {
  createProperty,
  updateProperty,
  type PropertyFormState,
} from "@/app/actions/properties";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AREA_UNITS, PRICE_UNITS, PROPERTY_STATUSES, PROPERTY_TYPES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { PropertyImageRow, PropertyRow } from "@/lib/database.types";

const INITIAL: PropertyFormState = { status: "idle" };

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="w-full rounded-full bg-ink px-6 text-white hover:bg-ink/90 lg:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Saving…
        </>
      ) : (
        <>
          <Save className="size-4" /> {isNew ? "Create listing" : "Save changes"}
        </>
      )}
    </Button>
  );
}

export function PropertyForm({
  property,
  images = [],
}: {
  property?: PropertyRow;
  images?: PropertyImageRow[];
}) {
  const isNew = !property;
  const [state, formAction] = useActionState(
    isNew ? createProperty : updateProperty,
    INITIAL,
  );
  const [stagedPaths, setStagedPaths] = useState<string[]>([]);
  const [price, setPrice] = useState(property ? String(property.price) : "");

  useEffect(() => {
    if (state.status === "error" && state.message && !state.fieldErrors) {
      toast.error(state.message);
    }
    if (state.status === "idle" && state.message === "Saved") {
      toast.success("Listing saved");
    }
  }, [state]);

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="space-y-8">
      {property && <input type="hidden" name="id" value={property.id} />}
      {isNew &&
        stagedPaths.map((path) => (
          <input key={path} type="hidden" name="imagePath" value={path} />
        ))}

      <Card title="Basics">
        <div className="space-y-5">
          <FieldWrap
            label="Listing title"
            htmlFor="title"
            error={err("title")}
            hint="How a buyer would describe it — e.g. “8 aana road-touched land in Butwal-11”."
          >
            <Input
              id="title"
              name="title"
              defaultValue={property?.title}
              required
              aria-invalid={Boolean(err("title"))}
            />
          </FieldWrap>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrap label="Property type" htmlFor="type" error={err("type")}>
              <Select name="type" defaultValue={property?.type ?? "land"}>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWrap>

            <FieldWrap label="Status" htmlFor="status" error={err("status")}>
              <Select name="status" defaultValue={property?.status ?? "available"}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWrap>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
            <Checkbox
              id="featured"
              name="featured"
              defaultChecked={property?.featured ?? false}
              className="mt-0.5"
            />
            <Label htmlFor="featured" className="cursor-pointer font-normal">
              <span className="block text-sm font-medium text-ink">Feature on homepage</span>
              <span className="mt-0.5 block text-xs text-ink-muted">
                Featured listings appear first in the “Recently listed” section.
              </span>
            </Label>
          </div>
        </div>
      </Card>

      <Card title="Price & area">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
            <FieldWrap
              label="Price (NPR)"
              htmlFor="price"
              error={err("price")}
              hint={price ? formatPrice(Number(price)) : "Digits only — no commas."}
            >
              <Input
                id="price"
                name="price"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
                required
                aria-invalid={Boolean(err("price"))}
              />
            </FieldWrap>

            <FieldWrap label="Price basis" htmlFor="price_unit" error={err("price_unit")}>
              <Select name="price_unit" defaultValue={property?.price_unit ?? "total"}>
                <SelectTrigger id="price_unit" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u === "total" ? "Total price" : u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWrap>
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
            <FieldWrap label="Area" htmlFor="area" error={err("area")}>
              <Input
                id="area"
                name="area"
                inputMode="decimal"
                defaultValue={property?.area ?? ""}
                placeholder="8"
              />
            </FieldWrap>

            <FieldWrap label="Area unit" htmlFor="area_unit" error={err("area_unit")}>
              <Select name="area_unit" defaultValue={property?.area_unit ?? "aana"}>
                <SelectTrigger id="area_unit" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREA_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWrap>
          </div>

          <FieldWrap
            label="Road access"
            htmlFor="road_access"
            error={err("road_access")}
            hint="Optional — e.g. “12 ft blacktopped road”."
          >
            <Input
              id="road_access"
              name="road_access"
              defaultValue={property?.road_access ?? ""}
            />
          </FieldWrap>
        </div>
      </Card>

      <Card title="Location">
        <div className="space-y-5">
          <FieldWrap label="Address" htmlFor="address" error={err("address")}>
            <Input
              id="address"
              name="address"
              defaultValue={property?.address}
              placeholder="Butwal-11, Rupandehi"
              required
              aria-invalid={Boolean(err("address"))}
            />
          </FieldWrap>

          <div className="grid gap-5 sm:grid-cols-3">
            <FieldWrap label="City / town" htmlFor="city" error={err("city")}>
              <Input id="city" name="city" defaultValue={property?.city ?? ""} placeholder="Butwal" />
            </FieldWrap>

            <FieldWrap label="Latitude" htmlFor="lat" error={err("lat")}>
              <Input
                id="lat"
                name="lat"
                inputMode="decimal"
                defaultValue={property?.lat ?? ""}
                placeholder="27.7006"
              />
            </FieldWrap>

            <FieldWrap label="Longitude" htmlFor="lng" error={err("lng")}>
              <Input
                id="lng"
                name="lng"
                inputMode="decimal"
                defaultValue={property?.lng ?? ""}
                placeholder="83.4487"
              />
            </FieldWrap>
          </div>

          <p className="text-xs leading-relaxed text-ink-muted">
            To get the coordinates: open Google Maps, long-press the plot, and copy
            the two numbers it shows. Without them the listing page hides the map.
          </p>
        </div>
      </Card>

      <Card title="Description">
        <FieldWrap
          label="Details for buyers"
          htmlFor="description"
          error={err("description")}
          hint="Leave a blank line between paragraphs. Mention access, facing, nearby landmarks and what the papers look like."
        >
          <Textarea
            id="description"
            name="description"
            rows={9}
            defaultValue={property?.description ?? ""}
          />
        </FieldWrap>
      </Card>

      <Card
        title="Photos"
        subtitle={
          isNew
            ? "Photos upload straight away and attach when you create the listing."
            : "Drag to reorder. The first photo is the cover."
        }
      >
        <ImageUploader
          propertyId={property?.id}
          images={images}
          onStagedChange={setStagedPaths}
        />
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

      {/* On phones this rides above the tab bar so saving never means scrolling
          to the bottom of a long form; from lg up it sits inline as normal. */}
      <div className="sticky bottom-16 z-30 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:bottom-auto lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:pt-6 lg:backdrop-blur-none">
        <div className="flex items-center gap-3 lg:justify-end">
          <Button asChild variant="ghost" className="hidden rounded-full lg:inline-flex">
            <Link href="/admin/listings">Cancel</Link>
          </Button>
          <SaveButton isNew={isNew} />
        </div>
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
