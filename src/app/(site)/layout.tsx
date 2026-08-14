import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { SetupNotice } from "@/components/site/setup-notice";
import { getSiteSettings } from "@/lib/queries";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <SetupNotice />
    </>
  );
}
