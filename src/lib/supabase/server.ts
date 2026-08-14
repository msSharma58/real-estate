import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 *
 * Cookie writes throw inside Server Components (they may not mutate the
 * response); the middleware refreshes the session there instead, so the throw
 * is safely ignored.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — middleware handles the refresh.
        }
      },
    },
  });
}
