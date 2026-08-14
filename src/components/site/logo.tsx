import Link from "next/link";

import { cn } from "@/lib/utils";

type Variant = "dark" | "light";

/**
 * Logo artwork.
 *
 * Preferred: drop the real files in `public/` and point these env vars at them
 * (see .env.example). Anything set here is used verbatim, so the mark matches
 * the supplied artwork exactly.
 *
 *   NEXT_PUBLIC_LOGO_SRC        full lockup, for light backgrounds
 *   NEXT_PUBLIC_LOGO_SRC_LIGHT  full lockup, knocked out for dark backgrounds
 *   NEXT_PUBLIC_LOGO_MARK_SRC   mark only (no wordmark), for tight spaces
 *
 * Until those exist, the hand-traced SVG below stands in. It approximates the
 * artwork rather than reproducing it — treat it as a placeholder.
 */
const LOGO_SRC = process.env.NEXT_PUBLIC_LOGO_SRC || "";
const LOGO_SRC_LIGHT = process.env.NEXT_PUBLIC_LOGO_SRC_LIGHT || "";
const LOGO_MARK_SRC = process.env.NEXT_PUBLIC_LOGO_MARK_SRC || "";

const RED = "#D32F2F";

/* -------------------------------------------------------------------------- */
/* Traced fallback                                                            */
/* -------------------------------------------------------------------------- */

const GRAY_POLY = "22.30,41.34 56.86,74.46 40.26,91.78 5.70,58.66";
const INK_POLY =
  "56.86,74.46 61.24,78.66 130.37,-0.34 133.63,32.34 62.75,113.34 40.26,91.78";
const RED_POLY = "130.37,-0.34 215.28,64.46 200.72,83.54 133.63,32.34";

function TracedMark({ variant }: { variant: Variant }) {
  const ink = variant === "light" ? "#FFFFFF" : "#1E1E1E";
  const gray = variant === "light" ? "rgba(255,255,255,0.5)" : "#8A8A8A";

  return (
    <svg viewBox="-3 -6 226 128" fill="none" aria-hidden="true" className="h-full w-auto">
      <polygon points={GRAY_POLY} fill={gray} />
      <polygon points={INK_POLY} fill={ink} />
      <polygon points={RED_POLY} fill={RED} />
      <g fill={ink}>
        <rect x="137" y="54" width="9" height="9" />
        <rect x="149" y="54" width="9" height="9" />
        <rect x="137" y="66" width="9" height="9" />
        <rect x="149" y="66" width="9" height="9" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

/** Mark only — used where there is no room for the wordmark. */
export function LogoMark({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: Variant;
}) {
  if (LOGO_MARK_SRC) {
    return (
      /* Plain <img>: the artwork's intrinsic size isn't known ahead of time and
         `h-* w-auto` preserves whatever aspect ratio the file happens to have.
         A logo is a few KB, so next/image optimisation buys little here. */
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={LOGO_MARK_SRC}
        alt=""
        aria-hidden="true"
        className={cn("h-8 w-auto", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex h-8 items-center", className)}>
      <TracedMark variant={variant} />
    </span>
  );
}

/** Full lockup: mark plus wordmark. */
export function Logo({
  variant = "dark",
  className,
  href = "/",
  showTagline = false,
  markClassName,
}: {
  variant?: Variant;
  className?: string;
  href?: string;
  showTagline?: boolean;
  markClassName?: string;
}) {
  const src = variant === "light" ? LOGO_SRC_LIGHT || LOGO_SRC : LOGO_SRC;

  // A supplied lockup already contains the wordmark and tagline, so it replaces
  // the whole composition rather than sitting beside rendered text.
  if (src) {
    return (
      <Link
        href={href}
        className={cn("flex items-center", className)}
        aria-label="Prime Real Estate — home"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Prime Real Estate"
          className={cn("h-9 w-auto transition-transform duration-300", markClassName)}
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="Prime Real Estate — home"
    >
      <span
        className={cn(
          "inline-flex h-7 shrink-0 items-center transition-transform duration-300 group-hover:-translate-y-0.5",
          markClassName,
        )}
      >
        <TracedMark variant={variant} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-wordmark text-[1.0625rem] font-bold leading-none tracking-[-0.01em]">
          <span className={variant === "light" ? "text-white" : "text-ink"}>Prime </span>
          <span style={{ color: RED }}>Real Estate</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 font-wordmark text-[0.5625rem] leading-none",
              variant === "light" ? "text-white/55" : "text-ink-muted",
            )}
          >
            Your Trusted Real Estate Partner
          </span>
        )}
      </span>
    </Link>
  );
}
