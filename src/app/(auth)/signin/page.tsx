"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { GoogleButton } from "@/components/auth/GoogleButton";

function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextUrl = search.get("next") ?? "/dashboard";
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "password") {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: nextUrl,
        });
        if (err) {
          setError(err.message ?? "Sign-in failed");
        } else {
          router.push(nextUrl);
          router.refresh();
        }
      } else {
        const { error: err } = await authClient.signIn.magicLink({
          email,
          callbackURL: nextUrl,
        });
        if (err) {
          setError(err.message ?? "Could not send magic link");
        } else {
          setInfo(
            "We sent you a sign-in link. Check your email (or the dev console if running locally).",
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
        Welcome back
      </h1>
      <p className="text-on-surface-variant text-body-md font-body-md mb-6">
        Sign in to keep designing.
      </p>

      <div className="flex gap-1 mb-6 p-1 bg-surface-container-low/60 rounded-full">
        <button
          type="button"
          onClick={() => {
            setMode("password");
            setError(null);
            setInfo(null);
          }}
          className={
            "flex-1 text-label-sm font-label-sm py-2 rounded-full transition-colors " +
            (mode === "password"
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:text-on-surface")
          }
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("magic");
            setError(null);
            setInfo(null);
          }}
          className={
            "flex-1 text-label-sm font-label-sm py-2 rounded-full transition-colors " +
            (mode === "magic"
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:text-on-surface")
          }
        >
          Magic link
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-label-sm font-label-sm text-on-surface-variant">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-surface-container-high/60 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
            placeholder="you@example.com"
          />
        </label>

        {mode === "password" && (
          <label className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                Password
              </span>
              <Link
                href="/forgot-password"
                className="text-label-sm font-label-sm text-primary hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-container-high/60 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
              placeholder="At least 8 characters"
            />
          </label>
        )}

        {error && (
          <p className="text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {info && (
          <p className="text-tertiary text-label-sm font-label-sm bg-tertiary-container/15 border border-tertiary/20 rounded-lg px-3 py-2">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-on-primary font-label-md text-label-md py-3 rounded-full hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading
            ? "Working…"
            : mode === "password"
              ? "Sign in"
              : "Send magic link"}
        </button>

        <GoogleDivider next={nextUrl} />
      </form>

      <p className="text-center mt-6 text-label-sm font-label-sm text-on-surface-variant">
        New to Addvoxen?{" "}
        <Link
          href={`/signup${nextUrl !== "/dashboard" ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
          className="text-primary hover:underline font-label-md"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}

function GoogleDivider({ next }: { next: string }) {
  return (
    <>
      <div className="relative flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-label-sm font-label-sm text-on-surface-variant">
          or
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <GoogleButton next={next} label="Continue with Google" />
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
