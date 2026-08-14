/**
 * Display formatting for prices, areas and dates.
 *
 * Prices use the South Asian lakh/crore scale rather than million/billion —
 * "Rs 1.25 Cr" is how a buyer in Butwal reads a number, not "NPR 12,500,000".
 */

const LAKH = 100_000;
const CRORE = 10_000_000;

/** Groups digits the Nepali/Indian way: 1,25,00,000 rather than 12,500,000. */
export function groupNepali(value: number): string {
  const [whole, decimals] = Math.abs(value).toFixed(2).split(".");
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}`
    : last3;
  const sign = value < 0 ? "-" : "";
  return decimals === "00" ? `${sign}${grouped}` : `${sign}${grouped}.${decimals}`;
}

function trimZeros(n: number): string {
  return n
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}

/** Compact headline price: "Rs 1.25 Cr", "Rs 45 Lakh", "Rs 80,000". */
export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "Price on request";
  if (value >= CRORE) return `Rs ${trimZeros(value / CRORE)} Cr`;
  if (value >= LAKH) return `Rs ${trimZeros(value / LAKH)} Lakh`;
  return `Rs ${groupNepali(value)}`;
}

/** Exact price with full digits, for the detail page and admin table. */
export function formatPriceExact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `Rs ${groupNepali(value)}`;
}

/** "Rs 45 Lakh per aana" / "Rs 1.2 Cr" when the unit is a plain total. */
export function formatPriceWithUnit(
  value: number | null | undefined,
  unit: string | null | undefined,
): string {
  const price = formatPrice(value);
  if (!unit || unit === "total" || value == null) return price;
  return `${price} ${unit}`;
}

/** "8 aana", "2.5 ropani", "1,240 sq ft". */
export function formatArea(
  value: number | null | undefined,
  unit: string | null | undefined,
): string | null {
  if (value == null || Number.isNaN(value)) return null;
  const n = value >= 1000 ? groupNepali(value) : trimZeros(value);
  return `${n} ${unit ?? "aana"}`;
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "—";
  return new Date(input).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelative(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const then = new Date(input).getTime();
  const diffDays = Math.round((then - Date.now()) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round((then - Date.now()) / 3_600_000);
    if (Math.abs(diffHours) < 1) {
      return rtf.format(Math.round((then - Date.now()) / 60_000), "minute");
    }
    return rtf.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
  if (Math.abs(diffDays) < 365) return rtf.format(Math.round(diffDays / 30), "month");
  return rtf.format(Math.round(diffDays / 365), "year");
}

/** Digits only, for `tel:` and `wa.me` links. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(number: string, message?: string): string {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
