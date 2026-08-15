import Link from "next/link";

import { cn } from "@/lib/utils";

type Variant = "dark" | "light";

/**
 * Logo artwork.
 *
 * The four files in `public/` are derived from the supplied master PNG. Ink and
 * red carry the brand on light surfaces; the `-white` pair knocks the ink out
 * for the dark footer, the hero overlay and the admin sidebar, leaving the red
 * roof panel intact. The lockup drops the tagline, which is illegible at the
 * sizes it renders at.
 *
 * The env vars let a deployment point at different artwork without a code
 * change (see .env.example).
 */
const LOGO_SRC = process.env.NEXT_PUBLIC_LOGO_SRC || "/logo.png";
const LOGO_SRC_LIGHT = process.env.NEXT_PUBLIC_LOGO_SRC_LIGHT || "/logo-white.png";
const LOGO_MARK_SRC = process.env.NEXT_PUBLIC_LOGO_MARK_SRC || "/logo-mark.png";
const LOGO_MARK_SRC_LIGHT =
  process.env.NEXT_PUBLIC_LOGO_MARK_SRC_LIGHT || "/logo-mark-white.png";

/* Plain <img> throughout: the artwork is a few KB and its intrinsic size is not
   known at build time when an env var overrides it, so `h-* w-auto` keeps
   whatever aspect ratio the file happens to have. next/image would need both
   dimensions up front and would buy nothing on a file this small. */

/** Mark only — used where there is no room for the wordmark. */
export function LogoMark({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: Variant;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={variant === "light" ? LOGO_MARK_SRC_LIGHT : LOGO_MARK_SRC}
      alt=""
      aria-hidden="true"
      className={cn("h-8 w-auto", className)}
    />
  );
}

/** Full lockup: mark plus wordmark. */
export function Logo({
  variant = "dark",
  className,
  href = "/",
  markClassName,
}: {
  variant?: Variant;
  className?: string;
  href?: string;
  markClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group flex items-center", className)}
      aria-label="Prime Real Estate — home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={variant === "light" ? LOGO_SRC_LIGHT : LOGO_SRC}
        alt="Prime Real Estate"
        className={cn(
          "h-10 w-auto transition-transform duration-300 group-hover:-translate-y-0.5",
          markClassName,
        )}
      />
    </Link>
  );
}
