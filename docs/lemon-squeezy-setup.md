# Lemon Squeezy setup (international payments)

Addvoxen-in beynəlxalq ödənişləri Lemon Squeezy üzərindən gedir. LS Merchant of Record-dur — vergi/VAT onların problemidir, sənin AZ MMC-n olmasa belə Visa/Mastercard/Apple Pay qəbul edə bilirsən.

## 1) Hesab aç

1. https://lemonsqueezy.com → **Get started**
2. Email + parol, sonra **Country = Azerbaijan**
3. Store adı: `Addvoxen`, currency: `USD`
4. **Verify identity:** Pasport / şəxsiyyət vəsiqəsi yüklə (1-2 saat və ya 1 iş günü təsdiq)
5. **Payout:** Wise hesabı qoş (USD/AZN qəbul edir)

## 2) Məhsulları yarat

Dashboard → **Products** → **Add new product**

### Pro Monthly
- Type: `Subscription`
- Name: `Addvoxen Pro`
- Price: `$12 / month`
- Trial: yoxdur
- Save → variant ID-ni kopyala (URL-də və ya variant səhifəsində görünür)

### Pro Yearly
- Eyni məhsula yeni variant: `$115 / year`

### Team Monthly
- New Product: `Addvoxen Team`
- Price: `$25 / month`

### Team Yearly
- `$240 / year`

Hər variant üçün ID-ni qeyd et (4-6 rəqəm olur, məs. `123456`).

## 3) API açarı

Settings → **API** → **Create API Key** → Name: `addvoxen-prod` → kopyala (yalnız bir dəfə göstərir, format `eyJ0...`).

## 4) Webhook qoş

Settings → **Webhooks** → **Add webhook**

- **Callback URL:** `https://addvoxen.com/api/billing/lemon-webhook`
  (lokal testdə Cloudflare tunnel URL-i istifadə et)
- **Signing secret:** **Generate** → kopyala
- **Events** seç:
  - `order_created`
  - `subscription_created`
  - `subscription_payment_success`
  - `subscription_payment_failed`
  - `subscription_cancelled`
- Save

## 5) `.env.local`-a yaz

```
LEMON_API_KEY="eyJ0..."
LEMON_STORE_ID="12345"
LEMON_WEBHOOK_SECRET="whsec_..."
LEMON_VARIANT_PRO_MONTHLY="123456"
LEMON_VARIANT_PRO_YEARLY="123457"
LEMON_VARIANT_TEAM_MONTHLY="123458"
LEMON_VARIANT_TEAM_YEARLY="123459"
```

## 6) Restart

```powershell
Stop-Process -Id <pid> -Force
./node_modules/.bin/next build
./node_modules/.bin/next start -p 3210
```

## 7) Test et

1. `/pricing` → "Upgrade to Pro" → `/checkout` açılır
2. Ölkə US, GB və ya digər kart-dəstəkli ölkədirsə → "Continue to secure checkout" düyməsi LS-in hostlu səhifəsinə aparır
3. Test mode-da `4242 4242 4242 4242` kartı istifadə et
4. Ödəniş tamamlanır → webhook bizə gəlir → `payment_intents.status` `paid` olur → user plan-ı `pro`-ya keçir → welcome email gedir

## 8) Lokal webhook test

LS production-only webhook göndərir. Lokalda test üçün:
- LS dashboard-da test mode aktiv et
- `cloudflared tunnel --url localhost:3210` ilə tunnel aç
- LS webhook URL-ini `<tunnel-url>/api/billing/lemon-webhook` et

## Komissiya

- **5% + $0.50** per transaction
- Wise payout: free (LS qarşılayır)
- VAT/Sales tax: LS qarşılayır

## Azerbaycan kartları üçün

LS Visa/Mastercard kartlarını dünyada qəbul edir, AZ kartları daxil. Local AZ kartı olan istifadəçi USD-də ödəyəcək (banki FX edir). Real AZN ödəniş istəyirsənsə bank transfer (Kapital IBAN) opsiyası /checkout-da hələ də var.
