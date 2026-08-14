import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Inter, Poppins } from "next/font/google";

import { Providers } from "@/components/site/providers";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/constants";
import { getSiteSettings } from "@/lib/queries";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Used only by the logo lockup, to match the supplied artwork's geometric sans.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${settings.name} — ${settings.tagline}`,
      template: `%s · ${settings.name}`,
    },
    description:
      "Land, houses, apartments and commercial property across Butwal, Rupandehi and Lumbini province. Browse verified listings with clear pricing and talk directly to the team.",
    keywords: [
      "land for sale Butwal",
      "property Nepal",
      "real estate Rupandehi",
      "aana land Butwal",
      "house for sale Lumbini",
    ],
    openGraph: {
      type: "website",
      locale: "en_NP",
      siteName: settings.name,
      title: `${settings.name} — ${settings.tagline}`,
      description:
        "Land, houses and commercial property across Butwal and Lumbini province, listed honestly and priced clearly.",
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
