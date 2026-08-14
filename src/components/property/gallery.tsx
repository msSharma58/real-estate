"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from "lucide-react";

import { storageUrl } from "@/lib/supabase/env";
import type { PropertyImageRow } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export function Gallery({
  images,
  title,
}: {
  images: PropertyImageRow[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const count = images.length;
  const go = useCallback(
    (delta: number) => {
      if (count === 0) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setLightbox(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50">
        <div className="text-center">
          <ImageOff className="mx-auto size-7 text-ink-muted/60" />
          <p className="mt-3 text-sm text-ink-muted">Photos coming soon</p>
        </div>
      </div>
    );
  }

  const current = images[index];
  const src = storageUrl(current.storage_path);

  return (
    <>
      <div className="space-y-3">
        <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {src && (
                <Image
                  src={src}
                  alt={current.alt ?? `${title} — photo ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {count > 1 && (
            <>
              <GalleryButton side="left" onClick={() => go(-1)} />
              <GalleryButton side="right" onClick={() => go(1)} />
            </>
          )}

          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="View full size"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-opacity duration-300 hover:bg-black/65 focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
          >
            <Expand className="size-4" />
          </button>

          <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {index + 1} / {count}
          </span>
        </div>

        {count > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((img, i) => {
              const thumb = storageUrl(img.storage_path);
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition-all duration-200",
                    i === index
                      ? "ring-brand"
                      : "ring-transparent opacity-65 hover:opacity-100",
                  )}
                >
                  {thumb && (
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && src && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — photo viewer`}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/92 p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-5 top-5 grid size-11 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-6" />
            </button>

            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[82vh] w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={current.alt ?? title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>

            {count > 1 && (
              <div onClick={(e) => e.stopPropagation()}>
                <GalleryButton side="left" onClick={() => go(-1)} large />
                <GalleryButton side="right" onClick={() => go(1)} large />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GalleryButton({
  side,
  onClick,
  large = false,
}: {
  side: "left" | "right";
  onClick: () => void;
  large?: boolean;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-all duration-300 hover:bg-black/70",
        large
          ? "size-12"
          : "size-10 focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
        side === "left" ? "left-4" : "right-4",
      )}
    >
      <Icon className={large ? "size-6" : "size-5"} />
    </button>
  );
}
