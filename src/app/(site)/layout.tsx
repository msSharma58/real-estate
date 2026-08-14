import { connection } from "next/server";

import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { SetupNotice } from "@/components/site/setup-notice";
import { SkipLink } from "@/components/site/skip-link";
import { getSiteSettings } from "@/lib/queries";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  // The header marks the current nav item, and four of those items differ only
  // by `?type=`, so every page under this layout renders from the request URL.
  // With Supabase configured, `getSiteSettings` reads cookies and makes these
  // routes dynamic anyway; without it, they become prerenderable and the build
  // fails on `useSearchParams`. This states the dependency instead of inheriting
  // it from whether an env var happens to be set.
  await connection();

  const settings = await getSiteSettings();

  return (
    <>
      <SkipLink />
      <Navbar settings={settings} />
      {/* `tabIndex={-1}` so the skip link actually moves focus here — without it
          several browsers jump the viewport but leave focus at the top, sending
          the next Tab straight back into the header. `scroll-mt` keeps the fixed
          header from covering whatever the jump lands on. */}
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 scroll-mt-[var(--header-h)] outline-none"
      >
        {children}
      </main>
      <Footer settings={settings} />
      <SetupNotice />
    </>
  );
}
