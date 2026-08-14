import type { NextConfig } from "next";

/**
 * Supabase Storage serves property photos from the project's own subdomain,
 * so the allowed image host is derived from the configured Supabase URL.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Unsplash is used only for the hero/placeholder photography.
      { protocol: "https" as const, hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
