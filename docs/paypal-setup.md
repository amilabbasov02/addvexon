# PayPal direct (Smart Buttons) setup

Bu axın LS-i yan keçir və müştərinin pulunu birbaşa **PayPal Business** hesabına göndərir. Hesab xarici dostuna məxsusdursa fərqi yoxdur — hesabın sahibinə pul gəlir, sonra Wise / SWIFT ilə AZ-ə köçürür.

## 1) PayPal Business hesab

Sənin xaricdəki dostun:
1. https://www.paypal.com/business → "Sign up for Business"
2. Country: özünün yaşadığı ölkə (ABŞ / Almaniya / UK / TR və s.)
3. Business name: `Addvoxen` (və ya öz adı)
4. Pasport + ünvan yoxlanışı
5. Bank hesabını qoş (oradakı bank)

## 2) Developer console

https://developer.paypal.com/dashboard

1. Yuxarı sağda **Live / Sandbox** keçidi var — başlanğıcda **Sandbox** istifadə et test üçün
2. Sol menyu → **Apps & Credentials**
3. **Create App** bas:
   - App name: `Addvoxen`
   - Type: `Merchant`
4. Yaranan app-ın içində:
   - **Client ID** (uzun string, məs. `Aa1B2c3...`)
   - **Secret** (Show düyməsi var, kopyala)

## 3) Webhook qur

App səhifəsinin altında **"Sandbox Webhooks"** (live üçün **Live Webhooks**) bölməsi var:

- **Add webhook**
- **Webhook URL:** `https://<sənin-domain>/api/billing/paypal/webhook`
  - Lokal test üçün: Cloudflare tunnel URL-i + `/api/billing/paypal/webhook`
- **Event types** seç:
  - `PAYMENT.CAPTURE.COMPLETED`
  - `PAYMENT.CAPTURE.DENIED`
  - `PAYMENT.CAPTURE.REFUNDED`
  - `PAYMENT.CAPTURE.REVERSED`
- Save → **Webhook ID** yaranır (məs. `WH-...`) — kopyala

## 4) `.env.local`-a yaz

```
PAYPAL_ENV="sandbox"            # test üçün; canlıda → "live"
PAYPAL_CLIENT_ID="Aa1B2c3..."
PAYPAL_CLIENT_SECRET="ELxxxx..."
PAYPAL_WEBHOOK_ID="WH-..."
NEXT_PUBLIC_PAYPAL_CLIENT_ID="Aa1B2c3..."    # eyni client id, browser üçün
NEXT_PUBLIC_PAYPAL_CURRENCY="USD"
```

## 5) Restart

```powershell
Stop-Process -Id <pid> -Force
./node_modules/.bin/next build
./node_modules/.bin/next start -p 3210
```

## 6) Test (Sandbox)

1. Sandbox-da PayPal sənə avtomatik test alıcı hesabları yaradır:
   - Developer dashboard → **Sandbox** → **Accounts**
   - "Personal" tipli hesab seç → password göstər
2. `/checkout?plan=pro&billing=monthly` aç
3. "Or pay with PayPal" bloku altında sarı **PayPal** düyməsi
4. Klik → popup açılır → sandbox alıcı emaili+parolu ilə daxil ol
5. **Pay $12.00** → popup bağlanır → /dashboard-a yönlənirsən
6. `/admin/payments` aç → status `paid`, paid_at dolu
7. Sənin admin email-inə "Welcome to Addvoxen pro" gəlməlidir

## 7) Live mode-a keçid

Hamısı sınanıb işləyəndə:
1. Developer dashboard yuxarısında **Live** seç
2. Eyni App → yeni client_id + secret görəcəksən (sandbox-dan FƏRQLİDİR)
3. `.env.local`-da:
   - `PAYPAL_ENV="live"`
   - yeni client_id + secret
4. Live webhook-u da yarat (Live Webhooks → Add)
5. Rebuild + restart

## Komissiya

- PayPal: ~3.49% + $0.49 (ölkədən asılı)
- Currency conversion: 3-4% spread (USD → AZN köçürəndə)
- Wise alternativi: USD-də saxlayıb 0.5% komissiya ilə Wise üzərindən AZN-ə

## Qeyd

- Smart Buttons SDK browser-də işləyir, server-side proxy yoxdur
- Refund / dispute / chargeback PayPal dashboard-dan idarə olunur — sənin sistemində avtomatik webhook ilə user plan-ı `free`-ə qayıdır

## Diaqnostika

- Düymə görünmür: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` boşdur ya da səhvdir
- "Could not create order": server log-da xəta var — env-də `PAYPAL_CLIENT_SECRET` doğru deyil
- Capture failed: order amount sandbox limit-ini keçib (default $10,000)
- Webhook 401: `PAYPAL_WEBHOOK_ID` env-də səhvdir
