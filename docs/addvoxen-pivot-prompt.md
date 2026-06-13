# TAPŞIRIQ: addvoxen-i "Hazır Saytlar Marketi + Managed Hosting" platformasına çevir

Sən `addvoxen` (Next.js 16 + React 19 + Drizzle + Neon Postgres + Vercel)
layihəsində işləyirsən. Kod, kommentlər, UI mətnləri **Azərbaycan dilində** olmalıdır.

## KONTEKST — indiki vəziyyət
addvoxen hazırda REKLAM BANNERİ dizayn aləti kimi qurulub (Konva canvas editor,
banner templates, adCampaigns). Biz onu TAM FƏRQLİ məhsula çeviririk.

SAXLA (reuse et): better-auth, Drizzle + Neon Postgres bağlantısı, ödəniş skeleti
(Stripe), admin UI komponentləri, marketplace UI, `userProfiles`/`templateComments`/
`templateLikes`/`pageViews` sxemləri.
ARXİVLƏ/SİL: banner-spesifik hissələr (Konva editor, banner generation, banner
campaign məntiqi) — yeni məhsula aid deyil.

## YENİ MƏHSUL
Hazır saytlar (landing + çoxsəhifəli) satan + managed hosting verən + abunə əsaslı
platforma. Marketplace-də 20 template (10 landing + 10 çoxsəhifəli) sərgilənir
(MVP-də 2-3 ilə başla). Ziyarətçi hamısına önizləmə baxa bilir (admin xaric). Hər
template-in öz səhifəsi var: təsvir + rating + comment.

### İki alış seçimi
1. **ABUNƏ (hosted):** 100 AZN giriş + 50 AZN/ay. Saytı BİZ host edirik
   (Vercel/Neon), müştəri öz domenini qoşur, öz admin panelindən idarə edir.
2. **EXPORT (self-host):** 1000 AZN bir dəfəlik. Frontend + admin + SQL dump +
   install README zip kimi verilir. Müştəri öz serverinə qoşur.

### Alış axını
Template seç → ödə → PLATFORMA SAHİBİNƏ bildiriş gəlir → sahib təsdiq vurur →
(abunə: müştərinin saytı aktivləşir | export: yükləmə linki açılır).

## TEXNİKİ MEMARLIQ
- Hər sayt **single-tenant self-contained** məntiqlə qurulsun (frontend + admin +
  öz datası) ki, HƏM hosted instance, HƏM export bundle verə bilsin.
- **Hosted = multi-tenant:** bir kod bazası, tenant-a görə data. Tenant
  identifikasiyası host-based routing ilə (domen/subdomenə görə).
- **Subdomen:** `*.addvoxen.com` wildcard DNS → Vercel.
- **Custom domen:** müştəri öz domenini A/CNAME ilə yönləndirir; Vercel domains API
  ilə avtomatik əlavə + auto-SSL.

## İKİ AYRI ADMIN (vacib — ayrı qur)
**A) PLATFORMA SUPER-ADMIN** (addvoxen sahibi üçün — biznesi idarə edir):
   - Template idarəsi, müştərilər, ödənişlər, alış təsdiqi
   - Per-tenant custom kod blokları (customHead, customBodyEnd, customCSS) —
     sahib redaktə edir (vetted/təhlükəsiz)
   - Reklam slotları: template-də adlı slotlar (hero-alti, mezmun-arasi, footer-
     ustu) → sahib hər tenant üçün reklam kodu təyin edir
   - Audit/versiya log (kim, nə vaxt, nə dəyişdi)
   - Analytics

**B) PER-TENANT MÜŞTƏRİ ADMIN** (hər müştəri öz saytını idarə edir):
   - Tam məzmun redaktəsi: mətnlər, şəkillər, RƏNGLƏR, LOGO, bölmələr —
     nöqtə-vergülə qədər hər detal
   - İnteqrasiyalar (YALNIZ STRUKTURLU SAHƏLƏR, raw script YOX):
     GA4 ID, Meta Pixel ID, **GTM container ID**, meta verification taqları
   - Öz domenini qoşma

## QİYMƏT STRUKTURU
| Məhsul | Qiymət | Kim üçün |
|---|---|---|
| Landing — abunə | 100 giriş + 50/ay | Adi müştəri |
| Landing — export | 1000 bir dəfəlik | Agentlik/developer |
| Çoxsəhifəli — abunə | daha yüksək giriş + 50-70/ay | Biznes |

## DİZAYN İSTİQAMƏTİ
- **AÇIQ, işıqlı tonlar:** ağ / açıq-boz fonlar, yumşaq pastel vurğu rəngləri,
  çoxlu boşluq (whitespace), modern sans-serif şrift, yuvarlaq künclər
- Dost, sadə, "saytını asanlıqla qur" hissi — ağır/tünd YOX
- Tam responsive, sürətli
- **Logo və favicon PLACEHOLDER kimi qoy** — asan dəyişdirilə bilən şəkildə
  (sonra real logo/favicon ilə əvəz olunacaq; bir yerdən mərkəzi idarə)

## TƏHLÜKƏSİZLİK
- Müştəriyə raw `<script>` paste imkanı VERMƏ → yalnız GTM/strukturlu sahələr
- Per-tenant custom kodu yalnız SUPER-ADMIN (sahib) əlavə edir
- Tenant izolasiyası: cookie/session izolə, CSP header

## MƏRHƏLƏLƏR (MVP əvvəl — scope creep-dən qaç)
1. **MVP:** abunə axını + 2-3 template + per-tenant admin (məzmun/rəng/logo redaktə)
   + GTM/GA sahələri + super-admin (alış təsdiqi) + custom domen + deploy
2. Export seçimi (zip + SQL + install docs)
3. Daha çox template + rating/comment + super-admin custom kod blokları + reklam slotları

## İLK ADDIM
Əvvəlcə layihəni analiz et, mövcud sxemi/strukturu raport et, sonra YUXARIDAKI
məhsula uyğun YENİ DB sxemini (sites/tenants, subscriptions, purchases, customCode,
adSlots) və faza-1 (MVP) plan ver. Banner-spesifik kodu silmədən əvvəl nəyin
reuse olunacağını dəqiqləşdir.
