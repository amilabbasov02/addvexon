"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * "Continue with Google" button that hides itself when the server has no
 * Google OAuth credentials configured. We probe /api/auth/providers on
 * mount and reveal the button only if google === true. This prevents the
 * frustrating "click → Failed to fetch" we used to ship by default.
 */
export function GoogleButton({
  next,
  label = "Continue with Google",
}: {
  next?: string;
  label?: string;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : { google: false }))
      .then((data) => {
        if (!cancelled) setEnabled(!!data.google);
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (enabled === null) {
    return (
      <div className="w-full py-3 rounded-full bg-surface-container-high/40 animate-pulse" />
    );
  }

  if (!enabled) {
    // Server hasn't been wired to Google yet — the button would just error,
    // so we just don't show it. Email/password + magic link still work.
    return null;
  }

  const onClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: next ?? "/dashboard",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="bg-surface-container-high/60 hover:bg-surface-container-high border border-white/10 text-on-surface font-label-md text-label-md py-3 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
          <path
            fill="#EA4335"
            d="M12 11v3.2h4.5a4.6 4.6 0 0 1-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.5-.2-2.2L12 11z"
          />
          <path
            fill="#34A853"
            d="M5.7 14.3l-.7.5-2.5 2A10 10 0 0 0 12 22c2.7 0 5-1 6.7-2.4l-3.2-2.5c-.9.6-2 1-3.5 1-2.6 0-4.9-1.8-5.7-4.2z"
          />
          <path
            fill="#FBBC05"
            d="M2.5 7.3A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.4l3.2-2.5a6 6 0 0 1 0-3.8L2.5 7.3z"
          />
          <path
            fill="#4285F4"
            d="M12 5.4c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 12 2 10 10 0 0 0 2.5 7.3l3.2 2.5C6.5 7.4 8.9 5.4 12 5.4z"
          />
        </svg>
        {loading ? "Opening Google…" : label}
      </button>
      {error && (
        <p className="text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </>
  );
}
