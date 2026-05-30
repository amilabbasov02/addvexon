"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useLocale } from "@/components/site/LocaleContext";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (err) {
        setError(err.message ?? "Could not send reset link");
      } else {
        setSent(true);
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
        {t("auth.forgot.title")}
      </h1>
      <p className="text-on-surface-variant text-body-md font-body-md mb-6">
        {t("auth.forgot.subtitle")}
      </p>

      {sent ? (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-tertiary text-5xl mb-3 inline-block">
            mark_email_read
          </span>
          <p className="text-on-surface font-label-md text-label-md mb-2">
            {t("auth.forgot.success.title")}
          </p>
          <p className="text-on-surface-variant text-body-md font-body-md">
            {(() => {
              const tpl = t("auth.forgot.success.body");
              const idx = tpl.indexOf("{email}");
              if (idx === -1) return tpl;
              return (
                <>
                  {tpl.slice(0, idx)}
                  <strong>{email}</strong>
                  {tpl.slice(idx + "{email}".length)}
                </>
              );
            })()}
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
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

          {error && (
            <p className="text-error text-label-sm font-label-sm bg-error-container/15 border border-error/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-on-primary font-label-md text-label-md py-3 rounded-full hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
          </button>
        </form>
      )}

      <p className="text-center mt-6 text-label-sm font-label-sm text-on-surface-variant">
        {t("auth.forgot.remember")}{" "}
        <Link
          href="/signin"
          className="text-primary hover:underline font-label-md"
        >
          {t("auth.signup.signin")}
        </Link>
      </p>
    </>
  );
}
