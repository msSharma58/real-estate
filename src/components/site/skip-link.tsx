/**
 * Bypass block for the fixed header (WCAG 2.4.1, Level A).
 *
 * Every page opens with the logo, five nav links, the phone number and the CTA.
 * Without this, keyboard and switch users tab through all eight on every single
 * navigation before reaching content.
 *
 * `focus:` rather than `focus-visible:` on purpose — a skip link has to reveal
 * itself whenever it takes focus, including the programmatic focus a
 * screen-reader or extension can hand it, and `:focus-visible` does not match
 * for links focused that way.
 *
 * Hidden until focused, then rendered as a real control rather than the
 * browser's default box: it is the first thing a keyboard user ever sees of this
 * site, so it carries the same pill language as the header.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-4 focus:z-[60] focus:inline-flex focus:items-center focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-background focus:shadow-lg focus:shadow-black/20 focus:outline-2 focus:outline-offset-2 focus:outline-brand sm:focus:left-8"
    >
      Skip to content
    </a>
  );
}
