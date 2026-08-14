import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Development-only nudge shown until Supabase env vars are present.
 * Never rendered in production builds.
 */
export function SetupNotice() {
  if (isSupabaseConfigured || process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[80] w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-brand-soft bg-brand-tint px-5 py-4 text-sm shadow-lg">
      <p className="font-semibold text-ink">Supabase isn&rsquo;t connected yet</p>
      <p className="mt-1 leading-relaxed text-ink-muted">
        Copy <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">.env.example</code>{" "}
        to <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">.env.local</code>,
        add your project URL and anon key, then run{" "}
        <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-xs">supabase/schema.sql</code>{" "}
        in the SQL editor. Listings stay empty until then.
      </p>
    </div>
  );
}
