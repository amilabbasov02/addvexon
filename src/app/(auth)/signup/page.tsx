"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useLocale } from "@/components/site/LocaleContext";

function SignUpForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { t } = useLocale();
  const nextUrl = search.get("next") ?? "/dashboard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await authClient.signUp.email({
        email,
        password,
        name: name.trim() || email.split("@")[0],
        callbackURL: nextUrl,
      });
      if (err) {
        setError(err.message ?? "Sign-up failed");
      } else {
        router.push(nextUrl);
        router.refresh();
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
        {t("auth.signup.title")}
      </h1>
      <p className="text-on-surface-variant text-body-md font-body-md mb-6">
        {t("auth.signup.subtitle")}
      </p>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-label-sm font-label-sm text-on-surface-variant">
            {t("auth.field.name_optional")}
          </span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-surface-container-high/60 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
            placeholder={t("auth.name.placeholder")}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label-sm font-label-sm text-on-surface-variant">
            {t("auth.field.email")}
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-surface-container-high/60 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
            placeholder={t("auth.email.placeholder")}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label-sm font-label-sm text-on-surface-variant">
            {t("auth.field.password")}
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-surface-container-high/60 border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
            placeholder={t("auth.password.placeholder")}
          />
          <span className="text-xs text-on-surface-variant mt-1">
            {t("auth.password.helper")}
          </span>
        </label>

        {error && (
          <p className="text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="ai-gradient text-on-primary font-label-md text-label-md py-3 rounded-full hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? t("auth.signup.submitting") : t("auth.signup.submit")}
        </button>

        <div className="relative flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-label-sm font-label-sm text-on-surface-variant">
            {t("ui.or")}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <GoogleButton next={nextUrl} label="Sign up with Google" />
      </form>

      <p className="text-center mt-6 text-label-sm font-label-sm text-on-surface-variant">
        {t("auth.signup.have_account")}{" "}
        <Link
          href={`/signin${nextUrl !== "/dashboard" ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
          className="text-primary hover:underline font-label-md"
        >
          {t("auth.signup.signin")}
        </Link>
      </p>

      <p className="text-center mt-4 text-xs text-on-surface-variant">
        {(() => {
          const tpl = t("auth.signup.tos");
          const termsKey = "{terms}";
          const privKey = "{privacy}";
          const ti = tpl.indexOf(termsKey);
          const pi = tpl.indexOf(privKey);
          const first = ti < pi ? termsKey : privKey;
          const second = ti < pi ? privKey : termsKey;
          const fi = tpl.indexOf(first);
          const si = tpl.indexOf(second);
          return (
            <>
              {tpl.slice(0, fi)}
              <Link href="/terms" className="hover:text-on-surface">
                {first === termsKey
                  ? t("auth.signup.tos.terms")
                  : t("auth.signup.tos.privacy")}
              </Link>
              {tpl.slice(fi + first.length, si)}
              <Link href="/privacy" className="hover:text-on-surface">
                {second === privKey
                  ? t("auth.signup.tos.privacy")
                  : t("auth.signup.tos.terms")}
              </Link>
              {tpl.slice(si + second.length)}
            </>
          );
        })()}
      </p>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
