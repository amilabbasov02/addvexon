# Stripe setup — 15-minute walkthrough

This is a one-time setup that unlocks paid plans on Addvoxen. You'll do it
inside the Stripe dashboard and then paste 5 values into `.env.local`.

## 1. Create a Stripe account (3 minutes)

1. Go to **https://dashboard.stripe.com/register**
2. Sign up with your email — no credit card required for test mode
3. Verify your email, set a password
4. When asked "what business?" — pick **"Other / I'll add this later"**
5. Country: pick your country (Azerbaijan is supported via international payouts)

You're now in **Test mode** — the toggle in the top-left says "Test mode".
Leave it on Test mode until we're ready for real payments.

## 2. Grab your API keys (1 minute)

1. Left sidebar → **Developers → API keys**
2. You'll see two keys:
   - **Publishable key** — starts with `pk_test_…`
   - **Secret key** — starts with `sk_test_…`
3. Copy both. Paste them into `.env.local`:
   ```
   STRIPE_SECRET_KEY="<your-sk-test-key-here>"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="<your-pk-test-key-here>"
   ```

## 3. Create the products + prices (5 minutes)

We need three prices: Pro Monthly, Pro Yearly, Team Monthly.

### Pro Monthly ($12/mo)

1. Left sidebar → **Product catalog → Add product**
2. Name: **`Addvoxen Pro`**
3. Description: `Unlimited designs, AI text & image, no watermark.`
4. Image: skip for now (upload your logo later)
5. Pricing → **Recurring**:
   - Price: **`12.00`** USD
   - Billing period: **Monthly**
6. Click **Save product**
7. After saving, click into the price you just made — copy the price ID
   (looks like `price_1Q8xyz…`)
8. Paste in `.env.local`:
   ```
   STRIPE_PRICE_PRO_MONTHLY="price_1Q8xyz..."
   ```

### Pro Yearly ($115/yr)

1. On the Addvoxen Pro product page → **Add another price**
2. Price: **`115.00`** USD
3. Billing period: **Yearly**
4. Save → copy the price ID
5. `.env.local`:
   ```
   STRIPE_PRICE_PRO_YEARLY="price_..."
   ```

### Team Monthly ($25/seat/mo)

1. **Add product** again
2. Name: **`Addvoxen Team`**
3. Pricing → **Recurring**:
   - Price: **`25.00`** USD
   - Billing period: **Monthly**
4. (Optional but recommended) **Per-seat pricing**:
   - Pricing model: **Standard pricing**
   - Or for true per-seat: **Quantity = number of team members** (handled later)
5. Save → copy the price ID
6. `.env.local`:
   ```
   STRIPE_PRICE_TEAM_MONTHLY="price_..."
   ```

## 4. Set up the webhook (3 minutes)

The webhook is how Stripe tells Addvoxen when a subscription is created,
cancelled or fails to renew. Without it, paid users would show up as Free
until they refresh the page manually.

### Local development (with the Stripe CLI)

Best for now — Stripe forwards real webhook events to your laptop.

1. Install the Stripe CLI: **https://docs.stripe.com/stripe-cli** (Windows
   has a direct download link)
2. Open PowerShell in the project folder:
   ```
   stripe login
   stripe listen --forward-to localhost:3210/api/webhooks/stripe
   ```
3. The CLI prints something like:
   ```
   Ready! Your webhook signing secret is whsec_xxxxxxxxxxxx
   ```
4. Copy that secret → `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"
   ```
5. **Leave the `stripe listen` command running** while you test —
   keep that terminal open.

### Production (after deploy)

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: **`https://YOUR_DOMAIN/api/webhooks/stripe`**
3. Select events to send:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Add endpoint → click into it → reveal **Signing secret** → copy
5. In Vercel (or wherever deployed): add `STRIPE_WEBHOOK_SECRET` env var

## 5. Restart the dev server

After updating `.env.local`, restart the dev server so Next.js picks up
the new env vars. Then test:

1. Go to **http://localhost:3210/pricing**
2. Click **Get Pro** → Stripe checkout opens
3. Use test card **`4242 4242 4242 4242`** (any future expiry, any CVC, any zip)
4. After paying, you're back on the dashboard with **Pro plan** badge
5. The webhook should fire and update your `plan` field in the DB

## 6. Test cards (for development)

- **`4242 4242 4242 4242`** — succeeds
- **`4000 0000 0000 9995`** — declined (insufficient funds)
- **`4000 0027 6000 3184`** — 3D Secure required
- More: **https://docs.stripe.com/testing**

## 7. Going live (when ready)

1. Stripe Dashboard → **Activate account** (top right) — fill in business
   details, bank info, etc.
2. Toggle from **Test mode → Live mode**
3. Re-create the products + prices in Live mode (or use Stripe's "Copy to
   live" feature)
4. Replace test keys with live keys (`sk_live_…`, `pk_live_…`) in
   production env vars
5. Set up the webhook endpoint with the live URL
6. First real $$$ comes in! 🎉

## Troubleshooting

- **"Stripe is not configured yet"** — `STRIPE_SECRET_KEY` is missing or
  empty in `.env.local`. After adding it, restart the dev server.
- **"No such price: price_..."** — make sure you copied the price ID, not
  the product ID (they look similar but products start with `prod_`).
- **Webhook 400 "Invalid signature"** — your `STRIPE_WEBHOOK_SECRET` is
  out of sync. With the CLI, the secret changes each `stripe listen` run.
- **Payment succeeds but plan doesn't upgrade** — webhook isn't firing.
  Check that `stripe listen` is running locally, or that the production
  endpoint is reachable.
