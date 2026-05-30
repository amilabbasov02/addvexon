"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PaypalSdk = any;

declare global {
  interface Window {
    paypal?: PaypalSdk;
  }
}

/**
 * Mounts the PayPal Smart Buttons SDK and renders the "Pay with PayPal"
 * button. On approval we call our /capture endpoint, which charges the
 * order and upgrades the user's plan, then we push them to /dashboard.
 */
export function PayPalButton({
  intentId,
  reference,
  currency,
}: {
  intentId: string;
  reference: string;
  currency: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setError("PayPal isn't configured yet — set NEXT_PUBLIC_PAYPAL_CLIENT_ID.");
      return;
    }

    const renderButtons = () => {
      const el = containerRef.current;
      if (!el || !window.paypal) return;
      el.innerHTML = ""; // re-render cleanly on remount
      window.paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal" },
          createOrder: async () => {
            const r = await fetch("/api/billing/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ intentId }),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data?.error ?? "Could not create order");
            return data.orderId as string;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onApprove: async (data: any) => {
            const r = await fetch("/api/billing/paypal/capture", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ intentId, orderId: data.orderID }),
            });
            const json = await r.json();
            if (!r.ok) {
              setError(json?.error ?? "Capture failed");
              return;
            }
            setDone(true);
            // Give the user a beat to see the success state then redirect.
            setTimeout(() => router.push(`/dashboard?upgrade=success&ref=${reference}`), 1200);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (err: any) => {
            console.error("PayPal error", err);
            setError("PayPal popup failed — try again or use card.");
          },
          onCancel: () => {
            setError("Payment cancelled.");
          },
        })
        .render(el);
    };

    // SDK already loaded?
    if (window.paypal) {
      renderButtons();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-paypal-sdk]",
    );
    if (existing) {
      existing.addEventListener("load", renderButtons, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId,
    )}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`;
    s.async = true;
    s.dataset.paypalSdk = "1";
    s.addEventListener("load", renderButtons, { once: true });
    s.addEventListener("error", () => setError("Could not load PayPal SDK"), {
      once: true,
    });
    document.body.appendChild(s);
  }, [intentId, reference, currency, router]);

  if (done) {
    return (
      <div className="bg-tertiary/15 border border-tertiary/40 rounded-2xl p-5 text-center">
        <span className="material-symbols-outlined text-tertiary text-3xl">
          check_circle
        </span>
        <p className="text-on-surface font-label-md text-label-md mt-2">
          Payment captured — upgrading your plan…
        </p>
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} />
      {error && (
        <p className="text-error text-label-sm font-label-sm mt-3">{error}</p>
      )}
    </div>
  );
}
