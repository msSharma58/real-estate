"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { SearchBar } from "@/components/property/search-bar";

// `||` not `??`: an env var present but empty ("NEXT_PUBLIC_HERO_IMAGE=") must
// fall back too, otherwise next/image throws on an empty src.
const HERO_IMAGE =
  process.env.NEXT_PUBLIC_HERO_IMAGE ||
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=70";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden">
      {/* Full-bleed property photograph, held back by a graded overlay so the
          headline and search bar stay readable on any crop. */}
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_35%,transparent_20%,rgba(0,0,0,0.45)_100%)]" />

      <div className="mx-auto w-full max-w-5xl px-5 pb-14 pt-24 text-center sm:px-8 sm:pb-20 sm:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-white/60 sm:text-[0.6875rem] sm:tracking-[0.2em]"
        >
          Butwal · Rupandehi · Lumbini Province
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-3xl font-display text-[1.875rem] font-semibold leading-[1.1] text-white xs:text-[2.125rem] sm:mt-5 sm:text-5xl sm:leading-[1.06] lg:text-6xl"
        >
          Land you can build on.{" "}
          <br className="hidden sm:inline" />
          Homes you can <span className="text-brand">move into</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-white/70 sm:mt-6 sm:text-[1.0625rem]"
        >
          Browse land, homes and commercial space across Butwal, Rupandehi and
          the wider Lumbini province — with full prices, plot details and a
          direct line to the team.
        </motion.p>

        <SearchBar className="mx-auto mt-7 max-w-3xl sm:mt-10" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.8125rem] text-white/55 sm:mt-10 sm:gap-x-8 sm:gap-y-3 sm:text-sm"
        >
          <span>Land, houses, apartments and commercial</span>
          <span className="hidden size-1 rounded-full bg-white/30 sm:block" />
          <span>Every price listed in full</span>
          <span className="hidden size-1 rounded-full bg-white/30 sm:block" />
          <span>Speak to the agent handling the listing</span>
        </motion.div>
      </div>
    </section>
  );
}
