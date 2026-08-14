import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/logo";

export const metadata: Metadata = {
  title: "Team login",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/admin";

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 self-start text-sm font-medium text-ink-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-4" />
          Back to site
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <Logo href="/" />

          <h1 className="mt-8 font-display text-2xl font-semibold text-ink">Team login</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Sign in to manage listings and view buyer enquiries. Accounts are
            created by an admin in Supabase.
          </p>

          <Suspense>
            <LoginForm next={next} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
