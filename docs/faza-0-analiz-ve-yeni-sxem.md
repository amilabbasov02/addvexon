# Faza 0 — Mövcud Layihə Analizi + Yeni DB Sxemi + Faza-1 (MVP) Planı

> Tarix: 2026-06-13
> Məqsəd: addvoxen-i **banner dizayn alətindən** → **hazır saytlar marketi + managed hosting** platformasına çevirmək.
> Bu sənəd kod silinməzdən ƏVVƏL hazırlanıb: nəyin saxlanacağı, nəyin arxivlənəcəyi və yeni memarlığın əsası burada təsbit edilir.

---

## 1. Mövcud vəziyyət — nə var (analiz)

**Stek:** Next.js 16 (App Router) · React 19 · Drizzle ORM · Neon Postgres (pg driver) · better-auth · Tailwind 4 · Stripe/PayPal/Lemon/bank skeleti · Konva canvas editor.

### 1.1 DB sxemi — 23 cədvəl, 3 kateqoriyaya bölünür

| Kateqoriya | Cədvəllər | Qərar |
|---|---|---|
| **Auth/identitet (təmiz reuse)** | `users`, `sessions`, `accounts`, `verifications` | ✅ SAXLA — olduğu kimi |
| **Ödəniş/abunə (reuse, uyğunlaşdır)** | `subscriptions`, `paymentIntents`, `purchases` | ♻️ SAXLA, AZN axınına uyğunlaşdır |
| **Sosial/icma (reuse)** | `templateLikes`, `templateComments`, `userProfiles`, `pageViews` | ✅ SAXLA — `templateId` FK-ni yeni `siteTemplates`-ə yönəlt |
| **Dəstək/waitlist (reuse)** | `supportRequests`, `waitlist`, `usageMetrics` | ✅ SAXLA |
| **Aktivlər (qismən reuse)** | `assets` | ♻️ SAXLA — `workspaceId`-dən `tenantId`-yə keç (logo/şəkil yüklənməsi üçün) |
| **Banner-spesifik (ARXİVLƏ)** | `adCampaigns`, `adAnalytics`, `bannerEvents`, `documents`, `workspaces`, `workspaceMembers`, `aiJobs`, `templates` (köhnə banner JSON) | 🗄️ Yeni məhsula aid deyil |

### 1.2 Route strukturu

- **Reuse:** `/`, `/(auth)/*`, `/marketplace`, `/u/[id]`, `/dashboard`, `/settings/profile`, `/pricing`, `/checkout`, `/support`, bütün `/admin/*`, `/api/auth`, `/api/billing/*`, `/api/profile`, `/api/me`, `/api/upload`, `/api/support`, `/api/analytics/pageview`.
- **Arxivlə (banner):** `/editor`, `/editor/pro`, `/banner/[slug]`, `/campaigns`, `/analytics`, `/api/documents/*`, `/api/campaigns/*`, `/api/admin/campaigns/*`, `/api/templates/[slug]/event`, `/api/ai/text`.
- **⚠️ `middleware.ts` YOXDUR** — multi-tenant üçün host-based routing burada qurulmalıdır (yeni iş).

### 1.3 Reuse oluna bilən infrastruktur (kod)

| Sahə | Fayllar | Status |
|---|---|---|
| Auth | `lib/auth.ts`, `auth-client.ts`, `session.ts`, `admin.ts` | ✅ Hazır. `admin.ts` `ADMIN_EMAILS` env ilə super-admin yoxlaması = platforma sahibi üçün hazırdır |
| Ödəniş | `lib/stripe.ts`, `lemon-squeezy.ts`, `paypal.ts`, `billing.ts`, `billing-pricing.ts` | ♻️ Skelet hazır; **yerli AZN provider (PayRiff/Kapital) lazım** — Stripe AZ-də işləmir |
| i18n | `lib/locales.ts` (az/tr/ru/en/es), `LocaleContext`, `LocaleSwitcher` | ✅ Hazır |
| UI (site) | `GlobalHeader`, `SiteHeader`, `SiteFooter`, `UserMenu`, `ThemeToggle` | ✅ Reuse |
| UI (admin/marketplace) | `MarketplaceFilters`, `MarketplaceHeader`, `dashboard/*`, admin səhifələri | ♻️ Reuse, məzmunu dəyiş |
| Köməkçi | `lib/ids.ts` (uid/slugify), `lib/email.ts` (Resend) | ✅ Hazır |
| **Arxivlə** | `components/editor/*` (10 fayl), `lib/export-engine.ts`, `lib/magic-resize.ts`, `lib/ad-formats.ts` | 🗄️ Konva/banner |

> **Tövsiyə:** Banner kodunu birbaşa SİLMƏ. `git` tarixçəsi qalır, amma əvvəl `legacy-banner` branch-i yarat (geri qaytarma sığortası), sonra `main`-də arxivlə. Aşağıdakı Faza-1 planı banner kodu hələ yerində olarkən paralel yeni cədvəllərlə başlayır.

---

## 2. Yeni DB sxemi

Memarlıq prinsipi: **hər müştəri saytı = 1 tenant**. Bir kod bazası, host-based routing ilə tenant müəyyən olunur. Məzmun tenant-a bağlı JSONB + strukturlu sahələrdə saxlanır ki, həm hosted, həm də (Faza 2) export bundle verilə bilsin.

### 2.1 Faza-1 (MVP) üçün ZƏRURİ yeni cədvəllər

> **Təsbit edilmiş qərarlar (2026-06-13):** Qiymət = **100 AZN giriş + 50 AZN/ay** (landing), export = **1000 AZN bir dəfəlik** · Hosting = **Vercel + Neon** (Vercel Domains API + auto-SSL) · **Export MVP-yə DAXİLDİR**.

```
siteTemplates        — kataloq: satılan hazır sayt şablonları (banner deyil)
tenants              — müştəri sayt instansiyaları (subdomen/custom domen)
tenantContent        — tenant-a görə redaktə olunan məzmun + tema (rəng/logo/mətn)
tenantIntegrations   — strukturlu inteqrasiya sahələri (GA4/Pixel/GTM/meta) — raw script YOX
orders               — alış + təsdiq axını (sahibə bildiriş → təsdiq → aktivləşmə)
tenantSubscriptions  — aylıq abunə vəziyyəti (AZN, lokal recurring)
exportBundles        — export sifarişləri üçün yüklənə bilən zip+SQL paketi (MVP-də)
```

**`siteTemplates`** (kataloq — `templates` banner cədvəlini ƏVƏZ edir)
| sütun | tip | qeyd |
|---|---|---|
| id | text PK | `tpl_xxx` |
| name, slug(unik) | text | |
| type | text | `landing` \| `multipage` |
| category, tagline, description | text | |
| thumbnailUrl, previewSubdomain | text | önizləmə canlı demo subdomeni |
| priceSetupAzn | integer | giriş haqqı (qəpik) |
| priceMonthlyAzn | integer | aylıq abunə |
| priceExportAzn | integer | export (Faza 2; nullable) |
| supportsExport | boolean | default false (MVP-də false) |
| published, sortOrder | boolean/int | |
| createdAt, updatedAt | timestamptz | |

**`tenants`** (müştəri saytı)
| sütun | tip | qeyd |
|---|---|---|
| id | text PK | `tnt_xxx` |
| ownerId | text FK→users (cascade) | müştəri |
| siteTemplateId | text FK→siteTemplates | hansı şablon |
| name | text | sayt adı |
| subdomain | text UNİK | `*.addvoxen.com` |
| customDomain | text UNİK nullable | müştəri domeni |
| vercelDomainId | text nullable | Vercel Domains API id (auto-SSL) |
| domainStatus | text | `none`\|`pending`\|`verified`\|`error` |
| status | text | `pending`\|`active`\|`suspended`\|`canceled` |
| deliveryType | text | `hosted`\|`export` |
| createdAt, updatedAt | timestamptz | |
| indekslər | subdomain(unik), customDomain(unik), ownerId, status |

**`tenantContent`** (redaktə olunan məzmun — per-tenant müştəri admin)
| sütun | tip | qeyd |
|---|---|---|
| tenantId | text PK FK→tenants (cascade) | |
| content | jsonb | bölmələr, mətnlər, şəkil URL-ləri |
| theme | jsonb | `{ colors, fonts, logoUrl, faviconUrl }` |
| updatedAt | timestamptz | |

**`tenantIntegrations`** (YALNIZ strukturlu sahələr — təhlükəsizlik)
| sütun | tip | qeyd |
|---|---|---|
| tenantId | text PK FK→tenants (cascade) | |
| ga4Id, metaPixelId, gtmContainerId | text nullable | |
| metaVerification, googleVerification | text nullable | |
| updatedAt | timestamptz | |

**`orders`** (alış + təsdiq axını)
| sütun | tip | qeyd |
|---|---|---|
| id | text PK | `ord_xxx` |
| buyerId | text FK→users (cascade) | |
| siteTemplateId | text FK→siteTemplates | |
| tenantId | text FK→tenants nullable | təsdiqdən sonra provision olunur |
| deliveryType | text | `hosted`\|`export` |
| setupAmountAzn, monthlyAmountAzn | integer | qəpik |
| status | text | `pending_payment`\|`paid`\|`awaiting_approval`\|`approved`\|`rejected`\|`refunded` |
| paymentRef | text | `paymentIntents.reference` ilə əlaqə |
| approvedBy | text FK→users nullable | super-admin |
| approvedAt | timestamptz nullable | |
| createdAt | timestamptz | |

**`tenantSubscriptions`** (aylıq abunə vəziyyəti — AZN, Stripe-dan asılı deyil)
| sütun | tip | qeyd |
|---|---|---|
| id | text PK | |
| tenantId | text FK→tenants (cascade) | |
| status | text | `active`\|`past_due`\|`canceled` |
| priceMonthlyAzn | integer | |
| currentPeriodEnd, lastPaymentAt, nextDueAt | timestamptz | |
| createdAt, updatedAt | timestamptz | |

### 2.2 Reuse olunan cədvəllərdə dəyişiklik

- `templateComments`, `templateLikes`: `templateId` FK-ni `templates` → **`siteTemplates`**-ə yönəlt (rating/comment hər şablonun səhifəsində).
- `assets`: `workspaceId` → `tenantId` (logo/şəkil yükləmələri).
- `paymentIntents`: olduğu kimi reuse — `reference` `orders.paymentRef` ilə bağlanır.

**`exportBundles`** (export paketi — MVP-də)
| sütun | tip | qeyd |
|---|---|---|
| id | text PK | `exp_xxx` |
| orderId | text FK→orders (cascade) | export tipli sifariş |
| zipUrl | text nullable | frontend+admin+README zip |
| sqlDumpUrl | text nullable | tenant data SQL dump |
| status | text | `building`\|`ready`\|`error` |
| expiresAt | timestamptz nullable | yükləmə linki müddəti |
| downloadCount | integer default 0 | |
| createdAt | timestamptz | |

### 2.3 Sonrakı fazalar üçün cədvəllər (indi qurma, sxemə yaz)

```
-- Faza 3 (super-admin genişlənmə):
tenantCustomCode     — tenantId PK, customHead, customBodyEnd, customCSS, updatedBy, updatedAt  (YALNIZ super-admin)
templateAdSlots      — id, siteTemplateId, slotKey (hero-alti/mezmun-arasi/footer-ustu), label
tenantAdSlots        — id, tenantId, slotKey, adCode, enabled, updatedAt  (super-admin doldurur)
auditLog             — id, actorId, tenantId, action, target, before(jsonb), after(jsonb), createdAt
```

---

## 3. İki admin ayrılığı (memarlıq)

- **A) Platforma Super-Admin** (`/admin/*`) — `admin.ts` `requireAdmin()` (ADMIN_EMAILS) ilə qorunur. Yeni: `/admin/orders` (alış təsdiqi), `/admin/tenants`, `/admin/site-templates`. Faza 3-də custom kod + reklam slotları + audit.
- **B) Per-tenant Müştəri Admin** (yeni route qrupu, məs. `/panel/*`) — tenant ownerId ilə qorunur. Məzmun/rəng/logo redaktəsi + `tenantIntegrations` strukturlu sahələr + domen qoşma. **Raw `<script>` paste YOXDUR.**

---

## 4. Faza-1 (MVP) Planı

> Prinsip: **3 template ilə tam axın** > 20 template ilə yarımçıq axın. Scope creep-dən qaç.

| Həftə | İş | Detallar |
|---|---|---|
| **1 — DB + tenant əsası** | Yeni 6 cədvəli (`db:generate` + `db:push`), banner cədvəllərini arxivlə (branch). `middleware.ts` — host-based tenant resolve (subdomain/customDomain → tenant). 2-3 `siteTemplates` seed (1 landing + 2 çoxsəhifəli). | better-auth, Drizzle, `ids.ts` reuse |
| **2 — Render engine** | Tenant məzmununu (`tenantContent.content`+`theme`) render edən şablon komponentləri. Konva editor YOX — server-rendered React seksiyalar. Ziyarətçi önizləməsi (`previewSubdomain`). Şablon səhifəsi: təsvir + rating + comment (reuse). | Marketplace UI reuse |
| **3 — Müştəri admin (`/panel`)** | Tenant owner məzmunu redaktə edir: mətn, rəng, logo (upload→`assets`), şəkil, bölmələr. `tenantIntegrations` formu (GA4/Pixel/GTM/meta). Dəyişiklik canlı saytda görünür. | `assets`, upload route reuse |
| **4 — Alış→təsdiq→deploy** | Alış axını: template seç → `orders` (pending_payment, `deliveryType` hosted/export) → AZN ödəniş (əl ilə bank köçürmə) → `paid` → **super-admin bildiriş** → `/admin/orders` təsdiq → **hosted:** tenant `active` + subdomain işə düşür; custom domen Vercel Domains API + auto-SSL. Bildiriş (`email.ts`). | Ödəniş + admin + email reuse |
| **5 — Export axını** | Export sifarişi təsdiqlənəndə: `exportBundles` qeydi → frontend+admin kodu + tenant `tenantContent`/`tenantIntegrations` SQL dump + install README zip → yükləmə linki açılır (müddətli). | `jszip` artıq var |

**MVP-də OLMAYACAQ:** super-admin custom kod blokları + reklam slotları (Faza 2), 20 template (3 ilə başla), tam avtomatik provisioning, gəlişmiş analytics, lokal kart provideri (əvvəl əl ilə bank köçürmə).

### Kritik xarici bloklar (kod deyil)
- ⚠️ **Yerli AZN ödəniş** (PayRiff/Kapital) — bank razılaşması 1–3 həftə. Stripe AZ-yə çıxmır. **MVP-də əl ilə bank köçürmə + super-admin əl təsdiqi ilə başla.**
- ⚠️ **Wildcard DNS** (`*.addvoxen.com` → Vercel) + Vercel Domains API token konfiqurasiyası.

---

## 5. Təsbit edilmiş qərarlar (2026-06-13)

İki sənədin ziddiyyəti həll olundu:

1. **Qiymət:** ✅ **100 AZN giriş + 50 AZN/ay** (landing abunə), export **1000 AZN** bir dəfəlik.
2. **Hosting:** ✅ **Vercel + Neon** — wildcard DNS → Vercel, custom domen Vercel Domains API + auto-SSL.
3. **Export:** ✅ **MVP-yə daxildir** (Həftə 5).

> `mvp-plan-ve-4ay-proqnoz.md`-dəki 200+20/ay və VPS/Caddy fərziyyələri köhnəlib — gəlir proqnozu yeni qiymətə (100+50) görə yenilənməlidir.

---

## 6. Növbəti addım

Bu plan təsdiqləndikdən sonra **Həftə 1** koduna başlamaq: yeni 6+1 cədvəli `src/db/schema.ts`-ə əlavə et, banner cədvəlləri üçün `legacy-banner` branch yarat, `middleware.ts` host-based tenant resolve qur, 3 `siteTemplates` seed et.
