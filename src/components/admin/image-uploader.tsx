"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { Reorder } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { attachImage, removeImage, reorderImages } from "@/app/actions/properties";
import { createClient } from "@/lib/supabase/client";
import { PROPERTY_IMAGE_BUCKET, storageUrl } from "@/lib/supabase/env";
import type { PropertyImageRow } from "@/lib/database.types";
import { cn } from "@/lib/utils";

/** Long edge and target weight for stored photos — keeps listing pages quick. */
const COMPRESSION = {
  maxSizeMB: 0.55,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp",
} as const;

export type StagedImage = { id: string; storage_path: string };

export function ImageUploader({
  propertyId,
  images,
  onStagedChange,
}: {
  /** Omitted while creating — uploads are staged and attached on save. */
  propertyId?: string;
  images: PropertyImageRow[] | StagedImage[];
  onStagedChange?: (paths: string[]) => void;
}) {
  const [items, setItems] = useState(images);
  const [syncedFrom, setSyncedFrom] = useState(images);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-sync when the server sends a fresh list (after revalidation), adjusting
  // state during render rather than in an effect.
  if (syncedFrom !== images) {
    setSyncedFrom(images);
    setItems(images);
  }

  const notifyStaged = useCallback(
    (next: typeof items) => {
      if (!propertyId) onStagedChange?.(next.map((i) => i.storage_path));
    },
    [propertyId, onStagedChange],
  );

  const upload = useCallback(
    async (files: File[]) => {
      const picked = files.filter((f) => f.type.startsWith("image/"));
      if (picked.length === 0) return;

      setUploading(true);
      setProgress({ done: 0, total: picked.length });
      const supabase = createClient();
      const added: StagedImage[] = [];

      for (const [i, file] of picked.entries()) {
        try {
          // Compress before upload so a 6 MB phone photo lands as ~400 KB.
          const compressed = await imageCompression(file, COMPRESSION);
          const path = `${propertyId ?? "staging"}/${crypto.randomUUID()}.webp`;

          const { error } = await supabase.storage
            .from(PROPERTY_IMAGE_BUCKET)
            .upload(path, compressed, {
              contentType: "image/webp",
              cacheControl: "31536000",
              upsert: false,
            });

          if (error) throw new Error(error.message);

          if (propertyId) await attachImage(propertyId, path);
          added.push({ id: path, storage_path: path });
        } catch (error) {
          console.error(error);
          toast.error(`Couldn't upload ${file.name}`);
        }
        setProgress({ done: i + 1, total: picked.length });
      }

      if (added.length > 0) {
        const next = [...items, ...added];
        setItems(next);
        notifyStaged(next);
        toast.success(`${added.length} photo${added.length > 1 ? "s" : ""} uploaded`);
      }

      setUploading(false);
      setProgress({ done: 0, total: 0 });
      if (inputRef.current) inputRef.current.value = "";
    },
    [items, propertyId, notifyStaged],
  );

  function handleRemove(item: (typeof items)[number]) {
    const next = items.filter((i) => i.id !== item.id);
    setItems(next);
    notifyStaged(next);

    if (propertyId && "property_id" in item) {
      startTransition(async () => {
        try {
          await removeImage(item.id, propertyId);
        } catch {
          toast.error("Couldn't delete that photo");
          setItems(items);
        }
      });
    } else if (!propertyId) {
      // Staged upload — clean the orphaned object straight away.
      void createClient().storage.from(PROPERTY_IMAGE_BUCKET).remove([item.storage_path]);
    }
  }

  function handleReorder(next: typeof items) {
    setItems(next);
    notifyStaged(next);
    if (propertyId) {
      startTransition(async () => {
        try {
          await reorderImages(
            propertyId,
            next.map((i) => i.id),
          );
        } catch {
          toast.error("Couldn't save the new order");
        }
      });
    }
  }

  /** Touch-friendly alternative to dragging, which fights page scroll on phones. */
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    handleReorder(next);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void upload(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver ? "border-brand bg-brand-tint" : "border-border bg-muted/40",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          id="property-photos"
          onChange={(e) => void upload(Array.from(e.target.files ?? []))}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-6 animate-spin text-brand" />
            <p className="text-sm text-ink-muted">
              Compressing and uploading {progress.done + 1} of {progress.total}…
            </p>
          </div>
        ) : (
          <>
            <ImagePlus className="mx-auto size-6 text-ink-muted/60" />
            <p className="mt-3 text-sm font-medium text-ink">
              Drop photos here, or{" "}
              <label
                htmlFor="property-photos"
                className="cursor-pointer text-brand underline-offset-2 hover:underline"
              >
                choose files
              </label>
            </p>
            <p className="mt-1.5 text-xs text-ink-muted">
              Resized to 1920px and converted to WebP automatically. The first
              photo is used as the listing cover.
            </p>
          </>
        )}
      </div>

      {items.length > 0 && (
        <Reorder.Group
          axis="y"
          values={items as StagedImage[]}
          onReorder={handleReorder as (v: StagedImage[]) => void}
          className="space-y-2"
        >
          {items.map((item, index) => {
            const url = storageUrl(item.storage_path);
            return (
              <Reorder.Item
                key={item.id}
                value={item}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-2.5"
              >
                <GripVertical className="hidden size-4 shrink-0 cursor-grab text-ink-muted/60 active:cursor-grabbing lg:block" />

                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {url && (
                    <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {index === 0 ? (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                      <Star className="size-3.5 fill-brand text-brand" />
                      Cover photo
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-ink">Photo {index + 1}</p>
                  )}
                  <p className="mt-0.5 truncate font-mono text-[0.6875rem] text-ink-muted">
                    {item.storage_path.split("/").pop()}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move photo ${index + 1} up`}
                    className="grid size-10 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-muted hover:text-ink disabled:opacity-30 md:size-9 lg:hidden"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label={`Move photo ${index + 1} down`}
                    className="grid size-10 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-muted hover:text-ink disabled:opacity-30 md:size-9 lg:hidden"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="grid size-10 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-destructive/10 hover:text-destructive md:size-9"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}
    </div>
  );
}
