import type { PropertyStatus, PropertyType } from "@/lib/database.types";

export const SITE = {
  name: "Prime Real Estate",
  tagline: "Your trusted real estate partner",
  phone: "+977 71 123456",
  whatsapp: "9779800000000",
  email: "hello@primerealestate.com.np",
  address: "Traffic Chowk, Butwal-11, Rupandehi, Nepal",
  lat: 27.7006,
  lng: 83.4487,
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;

export const PROPERTY_TYPES: { value: PropertyType; label: string; plural: string }[] = [
  { value: "land", label: "Land", plural: "Land" },
  { value: "house", label: "House", plural: "Houses" },
  { value: "apartment", label: "Apartment", plural: "Apartments" },
  { value: "commercial", label: "Commercial", plural: "Commercial" },
];

export const PROPERTY_STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "pending", label: "Under offer" },
  { value: "sold", label: "Sold" },
];

/** Units in everyday use for Nepali land and built area. */
export const AREA_UNITS = [
  "aana",
  "ropani",
  "dhur",
  "kattha",
  "bigha",
  "sq ft",
  "sq m",
] as const;

export const PRICE_UNITS = [
  "total",
  "per aana",
  "per ropani",
  "per dhur",
  "per kattha",
  "per bigha",
  "per sq ft",
] as const;

export const STATUS_STYLES: Record<PropertyStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  pending: "bg-amber-50 text-amber-800 ring-amber-600/20",
  sold: "bg-neutral-100 text-neutral-600 ring-neutral-500/20",
};
