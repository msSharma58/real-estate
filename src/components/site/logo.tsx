import Link from "next/link";

import { cn } from "@/lib/utils";

type Variant = "dark" | "light";

/**
 * Prime Real Estate mark.
 *
 * A checkmark whose long arm keeps rising into a roof peak: short arm in gray,
 * ascending stroke in black, right-hand roof slope in red, with a 2x2 window
 * under the eaves. Traced from the supplied artwork.
 *
 * Built from three filled polygons rather than strokes. The centreline runs
 * A(14,50) → V(62,96) → P(132,16) → R(208,74) at a half-thickness of 12; the
 * vertices below are the mitred offsets of that path, so neighbouring segments
 * share an exact edge and the apex resolves to a single sharp point instead of
 * one colour spiking over another.
 */

const GRAY_POLY = "22.30,41.34 56.86,74.46 40.26,91.78 5.70,58.66";
const INK_POLY =
  "56.86,74.46 61.24,78.66 130.37,-0.34 133.63,32.34 62.75,113.34 40.26,91.78";
const RED_POLY = "130.37,-0.34 215.28,64.46 200.72,83.54 133.63,32.34";

const RED = "#D32F2F";

export function LogoMark({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: Variant;
}) {
  const ink = variant === "light" ? "#FFFFFF" : "#1E1E1E";
  const gray = variant === "light" ? "rgba(255,255,255,0.5)" : "#8A8A8A";

  return (
    <svg
      viewBox="-3 -6 226 128"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-auto", className)}
    >
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

/**
 * Full lockup: mark plus wordmark. `Prime` in ink, `Real Estate` in red,
 * matching the supplied artwork.
 */
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
  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="Prime Real Estate — home"
    >
      <LogoMark
        variant={variant}
        className={cn(
          "h-7 w-auto shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5",
          markClassName,
        )}
      />
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
