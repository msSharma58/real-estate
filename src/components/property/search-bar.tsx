"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Hero search. Composes a `/listings` URL rather than filtering in place, so
 * the result is a shareable, indexable page.
 */
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [type, setType] = useState("any");
  const [budget, setBudget] = useState("any");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (type !== "any") params.set("type", type);
    if (budget !== "any") params.set("maxPrice", budget);
    router.push(`/listings${params.size ? `?${params}` : ""}`);
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "w-full rounded-2xl border border-white/15 bg-white/95 p-2 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:rounded-full",
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
          <Search className="size-4 shrink-0 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by area, city or landmark…"
            aria-label="Search properties"
            className="w-full bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-ink-muted"
          />
        </div>

        <div className="h-px bg-border sm:h-8 sm:w-px" />

        <Select value={type} onValueChange={setType}>
          <SelectTrigger
            aria-label="Property type"
            className="border-0 bg-transparent px-4 shadow-none focus-visible:ring-0 sm:w-[9.5rem]"
          >
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any type</SelectItem>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-px bg-border sm:h-8 sm:w-px" />

        <Select value={budget} onValueChange={setBudget}>
          <SelectTrigger
            aria-label="Maximum budget"
            className="border-0 bg-transparent px-4 shadow-none focus-visible:ring-0 sm:w-[10.5rem]"
          >
            <SelectValue placeholder="Any budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any budget</SelectItem>
            <SelectItem value="2500000">Up to Rs 25 Lakh</SelectItem>
            <SelectItem value="5000000">Up to Rs 50 Lakh</SelectItem>
            <SelectItem value="10000000">Up to Rs 1 Cr</SelectItem>
            <SelectItem value="25000000">Up to Rs 2.5 Cr</SelectItem>
            <SelectItem value="50000000">Up to Rs 5 Cr</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="submit"
          size="lg"
          className="h-12 rounded-xl bg-brand px-7 text-brand-foreground hover:bg-brand-strong sm:rounded-full"
        >
          <Search className="size-4" />
          Search
        </Button>
      </div>
    </motion.form>
  );
}
