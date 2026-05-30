/**
 * Server-side PayPal REST API wrapper.
 *
 * Why direct instead of via Lemon Squeezy: the user explicitly wants funds
 * to land in their own PayPal Business account (held by a foreign contact)
 * rather than going through an MoR. So we call PayPal's Orders v2 API
 * directly, capture on approve, and reconcile via webhooks for safety.
 *
 *   isPaypalConfigured()   — env keys present?
 *   getAccessToken()       — short-lived bearer for the Orders + Captures APIs
 *   createOrder(intent)    — returns PayPal order ID, sent to client SDK
 *   captureOrder(orderId)  — confirms payment, returns full capture details
 *   verifyWebhook(req)     — calls PayPal's verify endpoint with the headers
 *                            PayPal sends — only way to authenticate webhooks
 */

const SANDBOX = "https://api-m.sandbox.paypal.com";
const LIVE = "https://api-m.paypal.com";

export function isPaypalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function apiBase() {
  return (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase() === "live"
    ? LIVE
    : SANDBOX;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Tokens last ~9 hours; we cache until 60s before expiry to avoid edge races.
  if (cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) {
    return cachedToken.value;
  }
  const id = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const resp = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`PayPal token failed: ${resp.status} ${text}`);
  }
  const data = (await resp.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

export type CreateOrderInput = {
  amountCents: number;
  currency: string;
  reference: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
};

export async function createOrder(
  input: CreateOrderInput,
): Promise<{ id: string }> {
  const token = await getAccessToken();
  // PayPal expects "12.00" not 1200 cents.
  const value = (input.amountCents / 100).toFixed(2);
  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: input.reference,
        description: input.description.slice(0, 127),
        amount: {
          currency_code: input.currency.toUpperCase(),
          value,
        },
        custom_id: input.reference,
        invoice_id: input.reference,
      },
    ],
    application_context: {
      brand_name: "Addvoxen",
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
    },
  };
  const resp = await fetch(`${apiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`PayPal createOrder failed: ${resp.status} ${text}`);
  }
  const data = (await resp.json()) as { id: string };
  return { id: data.id };
}

export type CaptureResult = {
  id: string;
  status: string; // COMPLETED / DECLINED / PENDING
  purchaseUnits: Array<{
    reference_id?: string;
    custom_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: { value: string; currency_code: string };
      }>;
    };
  }>;
  payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
};

export async function captureOrder(orderId: string): Promise<CaptureResult> {
  const token = await getAccessToken();
  const resp = await fetch(
    `${apiBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`PayPal capture failed: ${resp.status} ${text}`);
  }
  const data = (await resp.json()) as {
    id: string;
    status: string;
    purchase_units: CaptureResult["purchaseUnits"];
    payer?: CaptureResult["payer"];
  };
  return {
    id: data.id,
    status: data.status,
    purchaseUnits: data.purchase_units,
    payer: data.payer,
  };
}

/**
 * Validate a webhook event using PayPal's official verify endpoint. PayPal
 * sends 5 headers (transmission id / time / sig / cert url / auth algo) +
 * we supply the webhook id from env + raw body.
 */
export async function verifyWebhook(
  headers: Record<string, string | null | undefined>,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const token = await getAccessToken();
  const payload = {
    transmission_id: headers["paypal-transmission-id"],
    transmission_time: headers["paypal-transmission-time"],
    cert_url: headers["paypal-cert-url"],
    auth_algo: headers["paypal-auth-algo"],
    transmission_sig: headers["paypal-transmission-sig"],
    webhook_id: webhookId,
    webhook_event: JSON.parse(rawBody),
  };
  const resp = await fetch(
    `${apiBase()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  if (!resp.ok) return false;
  const data = (await resp.json()) as { verification_status: string };
  return data.verification_status === "SUCCESS";
}
