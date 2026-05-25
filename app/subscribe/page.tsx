"use client";

import { useState } from "react";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Check your inbox for a confirmation link.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error === "invalid_email" ? "Please enter a valid email." : "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Subscribe</h1>
        <p className="text-[hsl(var(--color-muted))]">
          Get notified when new posts are published. No spam, unsubscribe anytime.
        </p>
      </div>

      <section className="rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] p-6 max-w-md">
        {status === "success" ? (
          <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 text-sm text-[hsl(var(--color-fg))] placeholder:text-[hsl(var(--color-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))]"
            />
            {status === "error" && (
              <p className="text-sm text-red-600">{message}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-11 items-center rounded-md bg-[hsl(var(--color-primary))] px-4 text-sm font-semibold text-[hsl(var(--color-primary-contrast))] hover:bg-[hsl(var(--color-accent))] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-bg))]"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
            <p className="text-xs text-[hsl(var(--color-muted))]">
              We use double opt-in. You&apos;ll receive a confirmation email first.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
