# addvoxen → Sayt-satan sistem: MVP Planı + 4 Aylıq Gəlir/Zərər Proqnozu

> Tarix: 2026-06-13 · Bütün rəqəmlər **AZN**-dədir (≈ qarşılığı $ kursla)
> Bu sənəd **proqnozdur, zəmanət deyil**. Bütün fərziyyələr aşağıda açıq yazılıb.

---

## 1. Biznes modeli (qərar verilmiş)

**Managed hosting / website-as-a-service:**
- Müştəri kataloqdan template seçir → ödəyir → sən təsdiqləyirsən → sayt **sənin serverində** canlanır → müştəri öz domenini qoşur → admindən idarə edir.
- Fayl satışı **YOX** (pirat riski). Sən host edirsən.

**Qiymət (başlanğıc):**
| Element | Qiymət |
|---|---|
| Bir dəfəlik quraşdırma (setup) | 200 AZN |
| Aylıq hosting + admin (abunə) | 20 AZN/ay |

---

## 2. MVP Planı (4 həftə — qurma mərhələsi)

Məqsəd: 20 yox, **3 template** ilə işləyən tam axın. ("Az template, tam axın" > "çox template, yarımçıq axın")

| Həftə | İş | addvoxen-dən gəlir? |
|---|---|---|
| **1** | Multi-tenant DB sxemi (sites, tenants), 3 sayt template-i (1 landing + 2 çoxsəhifəli) | DB+Drizzle ✅, auth ✅ skeleti |
| **2** | Səhifə render engine + tenant-a görə data (rəng/logo/mətn) | Yenidən qurulur (banner editor uyğun deyil) |
| **3** | Admin: müştəri öz saytını redaktə edir (mətn, rəng, logo, şəkil) | Admin UI skeleti ✅ |
| **4** | Ödəniş → təsdiq axını + bildiriş + custom domen qoşma + Caddy auto-SSL + server deploy | Ödəniş skeleti ✅ (amma yerli provider lazım) |

**Kritik bloklar (kod deyil, xarici):**
- ⚠️ **Yerli ödəniş** (PayRiff/Kapital) — bank razılaşması, 1-3 həftə gözləmə ola bilər. Stripe AZ-yə çıxarmır.
- ⚠️ Server (VPS) + wildcard DNS qurulumu.

**MVP-də OLMAYACAQ (sonraya):** 20 template-in hamısı, tam avtomatik provisioning, çoxlu ödəniş yolu, gəlişmiş analytics. Əvvəl əllə də olsa işləsin.

---

## 3. Xərclər (aylıq)

| Xərc | Aylıq (AZN) | Qeyd |
|---|---|---|
| VPS server | 60 | başlanğıc, onlarla sayt tutar |
| DB (Neon) | 40 | ay 1 pulsuz tier, sonra paid |
| Domen | ~2 | addvoxen.com (illik bölünüb) |
| Email/alətlər | 20 | |
| Reklam (təvazökar) | 150 | ay 2-dən başlayır |
| Ödəniş komissiyası | gəlirin ~3%-i | |

> 💡 **Ən böyük gizli xərc: SƏNİN VAXTIN.** Aşağıdakı hesabda nağd xərc kimi yoxdur, amma 4 həftə tam iş = real "xərc". Əgər bu vaxtda başqa iş görsən, onun "itən gəliri" də zərərdir.

---

## 4. 4 Aylıq Gəlir/Zərər — 3 Ssenari

### Müştəri artımı (kumulyativ aktiv abunəçi)

| | Ay 1 | Ay 2 | Ay 3 | Ay 4 |
|---|---|---|---|---|
| 🔴 Pessimist | 0 | 0 | 2 | 4 |
| 🟡 Real | 0 (qurma) | 2 | 5 | 9 |
| 🟢 Optimist | 0 | 4 | 10 | 18 |

---

### 🟡 REAL ssenari (ən ehtimallı)

| Ay | Yeni müştəri | Gəlir (setup + abunə) | Xərc | Aylıq nəticə | Kumulyativ |
|---|---|---|---|---|---|
| 1 | 0 | 0 | 82 | **−82** | −82 |
| 2 | 2 | 2×200 + 2×20 = 440 | 285 | **+155** | +73 |
| 3 | 3 | 3×200 + 5×20 = 700 | 291 | **+409** | +482 |
| 4 | 4 | 4×200 + 9×20 = 980 | 299 | **+681** | **+1 163** |

**4 ayın yekunu: ~+1 163 AZN xalis** (nağd xərc çıxılmaqla; öz vaxtın sayılmır)

---

### 🔴 PESSIMIST ssenari (tam mümkün)

| Ay | Gəlir | Xərc | Nəticə | Kumulyativ |
|---|---|---|---|---|
| 1 | 0 | 82 | −82 | −82 |
| 2 | 0 | 230 | −230 | −312 |
| 3 | 2×200+2×20 = 440 | 240 | +200 | −112 |
| 4 | 2×200+4×20 = 480 | 245 | +235 | **+123** |

**4 ayın yekunu: ~+123 AZN (faktiki olaraq zərər/sıfır)** — yəni 4 ay işləyib təxminən **pula çıxmırsan**, sadəcə öyrənirsən. Bu, yeni biznes üçün **normaldır**.

---

### 🟢 OPTIMIST ssenari (hər şey yaxşı gedərsə)

| Ay | Gəlir | Xərc | Nəticə | Kumulyativ |
|---|---|---|---|---|
| 1 | 0 | 82 | −82 | −82 |
| 2 | 4×200+4×20 = 880 | 320 | +560 | +478 |
| 3 | 6×200+10×20 = 1400 | 360 | +1040 | +1518 |
| 4 | 8×200+18×20 = 1960 | 400 | +1560 | **+3 078** |

**4 ayın yekunu: ~+3 078 AZN xalis**

---

## 5. Əsas həqiqətlər (oxu!)

1. **Ay 1 həmişə zərərdir** — qurma ayıdır, gəlir yoxdur. Bu normaldır.
2. **Break-even (pula çıxma) Ay 2-3-də olur** — yalnız satış gəlsə.
3. **Davamlı gəlir gücü abunədədir:** Ay 4-də 9 müştəri = ayda 180 AZN "passiv" gəlir, müştəri artdıqca böyüyür. Əsl pul **5-6-cı aydan sonra** abunələr yığılanda gəlir.
4. **Ən böyük risk — satış, kod deyil.** Sistem qurulacaq; sual "müştəri tapılacaqmı"dır. İlk müştərilər **birbaşa satışdan** gəlir (SEO/reklam yox).
5. **Sənin vaxtın bu hesabda pulsuzdur** — əslində deyil. 4 həftə tam əməyini nəzərə alsan, real "mənfəət" daha gecdir.

## 6. Tövsiyə olunan ardıcıllıq
1. Ödəniş provider müraciətini **bu gün** başlat (ən uzun gözləyən hissə).
2. 4 həftə MVP (3 template).
3. Launch + **birbaşa 20 potensial müştəriyə** təklif (restoran/salon/klinika).
4. İlk 2-3 satışdan sonra reklam + SEO-ya pul qoy.
5. Template sayını tələbə görə artır (20-yə tələs­mə).

---

## 7. 1 İLLİK (12 AY) PROQNOZ — Neon + Vercel, reklamsız

> Infrastruktur: **Neon Postgres + Vercel Pro** ($20/ay, kommersiya üçün məcburi).
> ⚠️ Vercel başlanğıcda ucuz, miqyasda baha (usage). Optimist ssenaridə bu görünür.
> Qiymət: 200 AZN setup (bir dəfəlik) + 20 AZN/ay abunə. $1 ≈ 1.7 AZN.

### 🔴 PESSIMIST
| Ay | Aktiv | Gəlir | Xərc | Aylıq | Kumulyativ |
|---|---|---|---|---|---|
| 1 | 0 | 0 | 56 | −56 | −56 |
| 2 | 0 | 0 | 56 | −56 | −112 |
| 3 | 1 | 220 | 63 | +157 | +45 |
| 4 | 2 | 240 | 63 | +177 | +222 |
| 5 | 2 | 240 | 95 | +145 | +367 |
| 6 | 3 | 260 | 104 | +156 | +523 |
| 7 | 4 | 280 | 105 | +175 | +698 |
| 8 | 4 | 280 | 105 | +175 | +873 |
| 9 | 5 | 500 | 118 | +382 | +1 255 |
| 10 | 6 | 320 | 112 | +208 | +1 463 |
| 11 | 7 | 540 | 120 | +420 | +1 883 |
| 12 | 8 | 560 | 121 | +439 | **+2 322** |

**Yekun ~+2 322 AZN · MRR 160 AZN/ay**

### 🟡 REAL
| Ay | Aktiv | Gəlir | Xərc | Aylıq | Kumulyativ |
|---|---|---|---|---|---|
| 1 | 0 | 0 | 56 | −56 | −56 |
| 2 | 2 | 440 | 69 | +371 | +315 |
| 3 | 4 | 480 | 70 | +410 | +725 |
| 4 | 6 | 720 | 120 | +600 | +1 325 |
| 5 | 9 | 980 | 137 | +843 | +2 168 |
| 6 | 12 | 1 040 | 144 | +896 | +3 064 |
| 7 | 15 | 1 100 | 151 | +949 | +4 013 |
| 8 | 19 | 1 380 | 187 | +1 193 | +5 206 |
| 9 | 23 | 1 460 | 200 | +1 260 | +6 466 |
| 10 | 27 | 1 540 | 212 | +1 328 | +7 794 |
| 11 | 32 | 1 840 | 231 | +1 609 | +9 403 |
| 12 | 37 | 1 940 | 244 | +1 696 | **+11 099** |

**Yekun ~+11 099 AZN · MRR 740 AZN/ay**

### 🟢 OPTIMIST
| Ay | Aktiv | Gəlir | Xərc | Aylıq | Kumulyativ |
|---|---|---|---|---|---|
| 1 | 0 | 0 | 56 | −56 | −56 |
| 2 | 4 | 880 | 92 | +788 | +732 |
| 3 | 9 | 1 180 | 143 | +1 037 | +1 769 |
| 4 | 16 | 1 720 | 180 | +1 540 | +3 309 |
| 5 | 25 | 2 300 | 235 | +2 065 | +5 374 |
| 6 | 36 | 2 920 | 284 | +2 636 | +8 010 |
| 7 | 48 | 3 560 | 353 | +3 207 | +11 217 |
| 8 | 62 | 4 240 | 413 | +3 827 | +15 044 |
| 9 | 78 | 4 960 | 495 | +4 465 | +19 509 |
| 10 | 95 | 5 500 | 551 | +4 949 | +24 458 |
| 11 | 115 | 6 500 | 671 | +5 829 | +30 287 |
| 12 | 138 | 7 560 | 763 | +6 797 | **+37 084** |

**Yekun ~+37 084 AZN · MRR 2 760 AZN/ay**

### Müqayisə
| | 🔴 Pessimist | 🟡 Real | 🟢 Optimist |
|---|---|---|---|
| 12 ay xalis | +2 322 | +11 099 | +37 084 |
| 12-ci ay aktiv | 8 | 37 | 138 |
| 12-ci ay MRR | 160 | 740 | 2 760 |

**Müşahidələr:** (1) Aşağı infra xərci → cəmi 2-3 müştəri ilə break-even; əsl risk pul itkisi yox, **0 müştəri**. (2) Optimistdə Vercel xərci 12-ci ayda 763 AZN — miqyasda VPS-ə köçmək lazımdır. (3) Bütün dəyər **MRR-dədir**, əsl pul 2-ci ildə yığılır.
