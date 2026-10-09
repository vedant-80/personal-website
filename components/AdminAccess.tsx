"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { adminSignIn, adminSignOut } from "@/lib/actions/auth";

export function AdminAccess({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function authenticate(signingOut: boolean) {
    setError(null);
    startTransition(async () => {
      try { await (signingOut ? adminSignOut(pathname) : adminSignIn(pathname)); }
      catch { setError("Unable to sign in. Please try again."); }
    });
  }
  return (
    <aside aria-label="Website administration" className={`${email ? "fixed inset-x-0 bottom-0 z-40" : "relative z-10"} border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg)/0.95)] backdrop-blur`}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs sm:px-8">
        {email ? <><span className="text-[hsl(var(--color-muted))]">Superuser · {email}</span><div className="flex flex-wrap items-center gap-5 text-[hsl(var(--color-link))]"><Link href="/admin">Manage website</Link><Link href="/admin/posts/new?kind=blog">New post</Link><Link href="/admin/posts/new?kind=project">New project</Link><button disabled={pending} onClick={() => authenticate(true)}>{pending ? "Please wait…" : "Sign out"}</button></div></> : <><span className="text-[hsl(var(--color-muted))]">Website owner</span><button disabled={pending} onClick={() => authenticate(false)} className="text-[hsl(var(--color-link))]">{pending ? "Signing in…" : "Admin sign in"}</button></>}
        {error && <p role="alert" className="w-full text-red-300">{error}</p>}
      </div>
    </aside>
  );
}
