/**
 * Demo məzmun — "forge" dizaynı: fitnes / idman klubu.
 *
 * Biznes UYDURMADIR: "Dəmirxana Fitnes Klubu". Telefon nömrələri, e-poçt və
 * ünvan nümunə xarakterlidir — real bir müəssisəyə aid deyil.
 *
 * Məzmun qaydaları (şablon satılan məhsul olduğu üçün ciddidir):
 *  - Heç bir nəticə iddiası yoxdur: "arıqlama faizi", "əvvəl/sonra", "çempion
 *    məşqçi", sertifikat orqanı, üzv sayı — heç biri işlədilmir. Bunlar
 *    yoxlanıla bilməyən iddialardır və hər tenant üçün yalan olar.
 *  - Statistika yalnız öz-özünü doğruldan göstəricilərdir: həftədəki məşğələ
 *    sayı, avadanlıq sayı, zal sahəsi, iş saatlarının uzunluğu.
 *  - Məşqçilərdə ad + vəzifə + neytral qısa bio var, dərəcə/titul yoxdur.
 *  - `imageUrl` sahələri qəsdən yazılmır — fotolar ayrı addımda əlavə olunur.
 *    `GallerySection` tipində `imageUrl` məcburi olduğu üçün orada boş sətir
 *    qalır; dizayn boş şəkilli elementləri süzgəcdən keçirib göstərmir.
 */
import type { LocalizedBundle, SiteTheme } from "../../src/lib/site-content";

/**
 * Forge tünd fonda işləyir və marka rəngini yalnız həndəsə üçün istifadə edir
 * (zolaqlar, xətlər, markerlər) — mətn arxasında heç vaxt. Ona görə doymuş
 * ərinti-narıncı təhlükəsizdir və qəsdən seçilmiş kimi görünür.
 */
export const forgeTheme: SiteTheme = {
  colors: {
    primary: "#ff4a17",
    bg: "#08080a",
    surface: "#101014",
    text: "#ffffff",
    muted: "#a3a3ad",
  },
  fonts: {
    heading: "Archivo, sans-serif",
    body: "Inter, sans-serif",
  },
};

const PHONE = "+994 12 000 00 00";
const MOBILE = "+994 50 000 00 00";
const EMAIL = "salam@demirxana.az";

export const forgeContent: LocalizedBundle = {
  defaultLocale: "az",
  locales: {
    /* ══════════════════════════════════════════════════════════════════════
       AZ
       ═══════════════════════════════════════════════════════════════════ */
    az: {
      design: "forge",
      siteName: "Dəmirxana",
      nav: [
        { label: "Məşğələlər", href: "#xidmetler" },
        { label: "Üzvlük", href: "#qiymetler" },
        { label: "Məşqçilər", href: "#komanda" },
        { label: "Suallar", href: "#faq" },
        { label: "Əlaqə", href: "#elaqe" },
      ],
      pages: [
        {
          slug: "",
          title: "Ana səhifə",
          sections: [
            {
              type: "hero",
              heading: "Ağırlıq yalan demir",
              subheading: "Dəmirxana Fitnes Klubu · Bakı, Nərimanov",
              ctaText: "Sınaq məşqinə yazıl",
              ctaUrl: "#elaqe",
            },
            {
              type: "stats",
              items: [
                { value: "48", label: "Həftədə qrup məşğələsi" },
                { value: "1 400 m²", label: "Zal sahəsi" },
                { value: "120+", label: "Trenajor və avadanlıq" },
                { value: "06:30–23:00", label: "Həftə içi iş saatları" },
              ],
            },
            {
              type: "features",
              heading: "Zalda nə var",
              subheading:
                "Beş məşq zonası və bir cədvəl. Hansı zonaya girsən, məşqçi yaxınlıqdadır — texnikanı soruşmaqdan çəkinmə.",
              items: [
                {
                  title: "Sərbəst çəkilər",
                  text: "Ştanq, ağırlıq daşları və sıxıcı dayaqlar. Səkkiz güc dayağı, hər birində ayrı ştanq dəsti, ona görə növbə gözləmək lazım gəlmir.",
                },
                {
                  title: "Funksional məşq",
                  text: "Kettlebell, halqa, kanat və sled zolağı. 45 dəqiqəlik dövrəvi məşqlər səhər və axşam cədvəlində.",
                },
                {
                  title: "Boks və kikboksinq",
                  text: "Ayrı ring, altı kisə və pəncə işi. Yeni başlayanlar üçün texnika qrupu ayrıca keçirilir, təcrübə tələb olunmur.",
                },
                {
                  title: "Kardio zonası",
                  text: "Qaçış lentləri, avarçəkmə və pilləkən trenajorları. Hər cihazda öz qulaqcığını qoşmaq üçün çıxış var.",
                },
                {
                  title: "Yoqa və çeviklik",
                  text: "Səhər açılış və axşam bağlanış seansları. Xalça və kəmərlər zalda verilir, özünlə gətirmək məcburi deyil.",
                },
                {
                  title: "Şəxsi məşq",
                  text: "Bir məşqçi ilə birə-bir iş: proqram, texnika və yük planı. Seans 55 dəqiqədir, əvvəlcədən yazılmaqla.",
                },
              ],
            },
            {
              type: "about",
              heading: "Alət çox, səs-küy az",
              body:
                "Dəmirxana 2019-cu ildə kiçik bir güc zalı kimi başladı və indi Nərimanov rayonunda iki mərtəbədə işləyir. İşin qaydası sadədir: avadanlıq işlək olsun, zal təmiz olsun, məşqçi soruşanda yanında olsun. Reklam çarxı yox, proqram satışı yox, «xüsusi metod» yox — normal zal, normal cədvəl. Zala ilk dəfə gələnlərin çoxu heç vaxt idmanla məşğul olmayıb; onlar üçün ayrı, yavaş başlayan qruplar var. Səhər 06:30-da açırıq ki, işə qədər məşq etmək istəyənlər tələsməsin, axşam 23:00-a qədər işləyirik ki, növbədən sonra gələnlər qapını bağlı görməsin.",
            },
            {
              type: "pricing",
              heading: "Üzvlük paketləri",
              subheading:
                "Dörd paket, gizli şərt yoxdur. Nəyin daxil olduğu və nəyin olmadığı hər paketin altında yazılıb.",
              items: [
                {
                  name: "Səhər",
                  price: "45 ₼",
                  unit: "aylıq",
                  desc: "Həftə içi 06:30–16:00 arası giriş. Səhər və ya günorta məşq edənlər üçün.",
                  features: [
                    "Güc və kardio zonalarına tam giriş",
                    "Şkaf, duş və dəsmal daxildir",
                    "Səhər cədvəlindəki qrup məşğələləri",
                    "Boks zonası daxil deyil",
                    "Həftə sonu giriş daxil deyil",
                  ],
                },
                {
                  name: "Tam giriş",
                  price: "70 ₼",
                  unit: "aylıq",
                  desc: "Bütün iş saatlarında, həftənin yeddi günü giriş.",
                  features: [
                    "Bütün məşq zonalarına vaxt məhdudiyyəti olmadan giriş",
                    "Həftədəki 48 qrup məşğələsinin hamısı",
                    "Şkaf, duş və dəsmal daxildir",
                    "İlk həftədə bir dəfə pulsuz texnika söhbəti",
                    "Üzvlüyü ildə 30 günə qədər dondurmaq hüququ",
                    "Şəxsi məşq seansları ayrıca ödənilir",
                  ],
                  featured: true,
                },
                {
                  name: "Tam giriş + Boks",
                  price: "95 ₼",
                  unit: "aylıq",
                  desc: "Tam girişin üstünə ring, kisə işi və boks qruplarının hamısı.",
                  features: [
                    "«Tam giriş» paketindəki hər şey",
                    "Boks və kikboksinq qruplarının hamısı",
                    "Ringdən sərbəst istifadə (cədvəl xaricində)",
                    "Əlcək və bandaj icarəsi daxildir",
                    "Kapa və başlıq özünlə olmalıdır",
                  ],
                },
                {
                  name: "Şəxsi məşq",
                  price: "240 ₼",
                  unit: "8 seans",
                  desc: "Bir məşqçi ilə birə-bir. Üzvlüyü olanlar üçün əlavə paket kimi satılır.",
                  features: [
                    "8 seans, hər biri 55 dəqiqə",
                    "İlk seansda hərəkət və duruş yoxlaması",
                    "Yazılı məşq proqramı",
                    "Seanslar 3 ay ərzində istifadə olunur",
                    "Zal üzvlüyü qiymətə daxil deyil",
                  ],
                },
              ],
              note: "Qiymətlər aylıq ödənişlə göstərilib. Kartın ilk açılışı bir dəfəlik 10 ₼-dir. 6 və 12 aylıq öncədən ödənişdə endirim tətbiq olunur — dəqiq məbləği qəbulda soruşa bilərsiniz. Qiymətlər dəyişə bilər; son variant zalda elan olunur.",
            },
            {
              type: "team",
              heading: "Məşqçilər",
              subheading:
                "Zalda hər növbədə ən azı iki məşqçi olur. Sual vermək üçün seans almaq lazım deyil.",
              items: [
                {
                  name: "Ramin Səfərli",
                  role: "Şəxsi məşqçi",
                  bio: "Güc məşqləri və ştanq texnikası ilə işləyir. Yeni başlayanlarla ilk iki həftəni yalnız hərəkət öyrənməyə ayırmağı üstün tutur.",
                },
                {
                  name: "Aysel Muradlı",
                  role: "Qrup məşğələləri məşqçisi",
                  bio: "Funksional və dövrəvi məşqləri aparır. Səhər cədvəlindəki 45 dəqiqəlik qruplar onun üzərindədir.",
                },
                {
                  name: "Elçin Nəbiyev",
                  role: "Boks məşqçisi",
                  bio: "Kisə və pəncə işi, ayaq hərəkəti. Təcrübəsi olmayanlar üçün ayrı, təmasısız texnika qrupu keçirir.",
                },
                {
                  name: "Nurlana Həsənli",
                  role: "Yoqa və çeviklik məşqçisi",
                  bio: "Açılış və bağlanış seanslarını aparır. Uzun müddət stolüstü işləyənlərlə bel və çiyin hərəkətliliyi üzərində çalışır.",
                },
              ],
            },
            {
              type: "process",
              heading: "İlk gün necə keçir",
              subheading:
                "Zalı görmədən ödəniş etmək lazım deyil. Ardıcıllıq belədir:",
              items: [
                {
                  title: "Zala bax",
                  text: "Zəng edib ya da sadəcə gəlib zalı gəzirsən. Cədvəli, avadanlığı və soyunub-geyinmə otağını öz gözünlə görürsən.",
                },
                {
                  title: "Sınaq məşqi",
                  text: "Bir dəfəlik pulsuz sınaq məşqi — istənilən qrup məşğələsi və ya sərbəst zal. Özünlə idman geyimi və su gətirmək kifayətdir.",
                },
                {
                  title: "Məqsədi danış",
                  text: "Məşqçi ilə 15 dəqiqəlik söhbət: nə istəyirsən, hansı ağrı və məhdudiyyət var, həftədə neçə gün vaxtın var.",
                },
                {
                  title: "Paketi seç və başla",
                  text: "Sənə uyğun paketi seçirsən, kartı qəbulda açırıq. Elə həmin gün ilk məşqə girə bilərsən.",
                },
              ],
            },
            {
              type: "gallery",
              heading: "Zal",
              items: [
                { imageUrl: "", caption: "Güc zonası, birinci mərtəbə" },
                { imageUrl: "", caption: "Sərbəst çəkilər və dayaqlar" },
                { imageUrl: "", caption: "Funksional məşq zolağı" },
                { imageUrl: "", caption: "Ring və kisələr" },
                { imageUrl: "", caption: "Kardio zonası" },
                { imageUrl: "", caption: "Soyunub-geyinmə otağı" },
              ],
            },
            {
              type: "testimonials",
              heading: "Üzvlər nə deyir",
              items: [
                {
                  quote:
                    "Səhər 07:00-da gəlirəm və dayaq gözləmək lazım gəlmir. Mənim üçün əsas məsələ bu idi.",
                  author: "Kamran A.",
                  role: "Üzv, «Səhər» paketi",
                  rating: 5,
                },
                {
                  quote:
                    "İdmanla heç vaxt məşğul olmamışdım. İlk həftə məşqçi yanımda dayanıb hərəkəti düzəltdi, ona görə qorxum keçdi.",
                  author: "Səbinə M.",
                  role: "Üzv, qrup məşğələləri",
                  rating: 5,
                },
                {
                  quote:
                    "Boks qrupunda təcrübəsizlərə ayrı yanaşırlar. Birinci ay heç kim məni ringə salmadı, texnika işlədik.",
                  author: "Tural H.",
                  role: "Üzv, «Tam giriş + Boks»",
                  rating: 4,
                },
                {
                  quote:
                    "Üzvlüyü səfər vaxtı bir ay dondurdum, geri qayıdanda heç bir problem olmadı. Şərtlər əvvəlcədən deyilmişdi.",
                  author: "Günel R.",
                  role: "Üzv, «Tam giriş»",
                  rating: 5,
                },
              ],
            },
            {
              type: "faq",
              heading: "Tez-tez verilən suallar",
              items: [
                {
                  question: "Ödəniş etməmişdən əvvəl sınaq məşqi etmək olar?",
                  answer:
                    "Bəli. Hər yeni gələn üçün bir dəfəlik pulsuz sınaq məşqi var — istər qrup məşğələsi, istər sərbəst zal. Qabaqcadan zəng edin ki, məşqçi sizi gözləsin.",
                },
                {
                  question: "Müqavilə nə qədər müddətə bağlanır?",
                  answer:
                    "Minimum müddət bir aydır. İllik və ya uzunmüddətli öhdəlik məcburi deyil; aylıq davam edə, istədiyiniz ay yeniləməyə bilərsiniz. 6 və 12 aylıq öncədən ödəniş yalnız endirim üçündür, tələb deyil.",
                },
                {
                  question: "Üzvlüyü dondurmaq mümkündür?",
                  answer:
                    "«Tam giriş» və «Tam giriş + Boks» paketlərində ildə cəmi 30 günə qədər dondurma hüququ var. Səyahət, xəstəlik və ya iş səfəri üçün istifadə edilir. Dondurmanı qəbulda və ya telefonla, başlamamışdan əvvəl bildirmək lazımdır.",
                },
                {
                  question: "Duş, şkaf və dəsmal var?",
                  answer:
                    "Bəli, hər üçü bütün paketlərə daxildir. Şkaflar məşq müddətinə verilir; daimi şkaf ayrıca ödənişlidir. Duş kabinələri hər iki soyunub-geyinmə otağındadır.",
                },
                {
                  question: "Qrup məşğələləri üzvlüyün qiymətinə daxildir?",
                  answer:
                    "«Tam giriş» paketində həftədəki bütün 48 məşğələ daxildir. «Səhər» paketində yalnız 06:30–16:00 arasındakı qruplar daxildir. Boks qrupları ayrıca paketdədir.",
                },
                {
                  question: "Şəxsi məşq nə qədərdir?",
                  answer:
                    "8 seanslıq paket 240 ₼-dir, hər seans 55 dəqiqə. Tək seans da almaq mümkündür. Şəxsi məşq zal üzvlüyünü əvəz etmir — üzvlüyün üstünə əlavə olunur.",
                },
                {
                  question: "Yaş həddi var?",
                  answer:
                    "16 yaşdan yuxarı sərbəst yazılmaq olar. 14–16 yaş arası yalnız valideyn razılığı ilə və məşqçi nəzarəti altında qəbul olunur. 14 yaşa qədər zal üzvlüyü vermirik.",
                },
              ],
            },
            {
              type: "hours",
              heading: "İş saatları",
              items: [
                { days: "Bazar ertəsi", hours: "06:30 – 23:00" },
                { days: "Çərşənbə axşamı", hours: "06:30 – 23:00" },
                { days: "Çərşənbə", hours: "06:30 – 23:00" },
                { days: "Cümə axşamı", hours: "06:30 – 23:00" },
                { days: "Cümə", hours: "06:30 – 23:00" },
                { days: "Şənbə", hours: "08:00 – 21:00" },
                { days: "Bazar", hours: "09:00 – 18:00" },
              ],
              note: "Qrup məşğələlərinin cədvəli qəbulda və zalın girişində elan olunur. Rəsmi bayram günlərində iş saatları qısaldılır; dəyişiklik bir həftə əvvəldən bildirilir.",
            },
            {
              type: "contact",
              heading: "Gəl, zalı gör",
              phone: PHONE,
              email: EMAIL,
              address: "Bakı, Nərimanov rayonu, Təbriz küçəsi 1A",
            },
            {
              type: "cta",
              heading: "Sınaq məşqi pulsuzdur",
              subheading:
                "Bir zəng — sizə uyğun saatı yazırıq, məşqçi qapıda qarşılayır. Ödəniş və ya öhdəlik yoxdur.",
              ctaText: "Üzvlük paketlərinə bax",
              ctaUrl: "#qiymetler",
            },
          ],
        },
      ],
      footer: {
        text: "© Dəmirxana Fitnes Klubu. Bu sayt nümunə məzmunla hazırlanmışdır.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp: " + MOBILE, href: "#" },
        ],
      },
    },

    /* ══════════════════════════════════════════════════════════════════════
       EN
       ═══════════════════════════════════════════════════════════════════ */
    en: {
      design: "forge",
      siteName: "Dəmirxana",
      nav: [
        { label: "Classes", href: "#xidmetler" },
        { label: "Membership", href: "#qiymetler" },
        { label: "Coaches", href: "#komanda" },
        { label: "Questions", href: "#faq" },
        { label: "Contact", href: "#elaqe" },
      ],
      pages: [
        {
          slug: "",
          title: "Home",
          sections: [
            {
              type: "hero",
              heading: "The weight never lies",
              subheading: "Dəmirxana Fitness Club · Baku, Narimanov",
              ctaText: "Book a trial session",
              ctaUrl: "#elaqe",
            },
            {
              type: "stats",
              items: [
                { value: "48", label: "Group classes per week" },
                { value: "1,400 m²", label: "Training floor" },
                { value: "120+", label: "Machines and equipment" },
                { value: "06:30–23:00", label: "Weekday opening hours" },
              ],
            },
            {
              type: "features",
              heading: "What's in the gym",
              subheading:
                "Five training zones and one timetable. Whichever zone you walk into, a coach is nearby — ask about your technique.",
              items: [
                {
                  title: "Free weights",
                  text: "Barbells, plates and squat racks. Eight power racks, each with its own barbell set, so you rarely wait for a station.",
                },
                {
                  title: "Functional training",
                  text: "Kettlebells, rings, ropes and a sled lane. Forty-five-minute circuits run on both the morning and evening timetable.",
                },
                {
                  title: "Boxing and kickboxing",
                  text: "A separate ring, six bags and pad work. Beginners get their own technique group — no previous experience needed.",
                },
                {
                  title: "Cardio zone",
                  text: "Treadmills, rowers and stair machines. Every unit has a jack so you can plug in your own headphones.",
                },
                {
                  title: "Yoga and mobility",
                  text: "Opening sessions in the morning, closing sessions at night. Mats and straps are provided; you don't have to bring your own.",
                },
                {
                  title: "Personal training",
                  text: "One-to-one work with a coach: programme, technique and load planning. Sessions run 55 minutes and are booked in advance.",
                },
              ],
            },
            {
              type: "about",
              heading: "Plenty of iron, very little noise",
              body:
                "Dəmirxana started in 2019 as a small strength room and now runs across two floors in the Narimanov district. The rules are simple: the equipment works, the floor is clean, and a coach is there when you ask. No promo reels, no packaged 'special method', no upselling — just a proper gym with a proper timetable. Most people who walk in for the first time have never trained before, so there are separate groups that start slowly. We open at 06:30 so anyone training before work isn't rushed, and stay open until 23:00 so nobody coming off a late shift finds the door locked.",
            },
            {
              type: "pricing",
              heading: "Memberships",
              subheading:
                "Four plans, no hidden conditions. What is included — and what isn't — is listed under each one.",
              items: [
                {
                  name: "Morning",
                  price: "45 ₼",
                  unit: "per month",
                  desc: "Weekday access between 06:30 and 16:00. For people who train early or at midday.",
                  features: [
                    "Full access to the strength and cardio zones",
                    "Locker, shower and towel included",
                    "Group classes on the morning timetable",
                    "Boxing zone not included",
                    "Weekend access not included",
                  ],
                },
                {
                  name: "Full access",
                  price: "70 ₼",
                  unit: "per month",
                  desc: "Access during all opening hours, seven days a week.",
                  features: [
                    "All training zones with no time restriction",
                    "All 48 group classes each week",
                    "Locker, shower and towel included",
                    "One free technique consultation in your first week",
                    "Right to freeze the membership for up to 30 days a year",
                    "Personal training sessions are paid separately",
                  ],
                  featured: true,
                },
                {
                  name: "Full access + Boxing",
                  price: "95 ₼",
                  unit: "per month",
                  desc: "Everything in Full access, plus the ring, bag work and all boxing groups.",
                  features: [
                    "Everything in the Full access plan",
                    "All boxing and kickboxing groups",
                    "Open ring use outside scheduled classes",
                    "Glove and wrap rental included",
                    "Mouthguard and headgear are your own",
                  ],
                },
                {
                  name: "Personal training",
                  price: "240 ₼",
                  unit: "8 sessions",
                  desc: "One-to-one with a coach. Sold as an add-on to an existing membership.",
                  features: [
                    "8 sessions, 55 minutes each",
                    "Movement and posture check in the first session",
                    "A written training programme",
                    "Sessions valid for 3 months",
                    "Gym membership not included in the price",
                  ],
                },
              ],
              note: "Prices are shown for monthly payment. Opening a new card is a one-off 10 ₼. Paying 6 or 12 months up front earns a discount — ask at reception for the exact figure. Prices may change; the current list is posted in the gym.",
            },
            {
              type: "team",
              heading: "Coaches",
              subheading:
                "There are at least two coaches on the floor during every shift. You don't need to buy a session to ask a question.",
              items: [
                {
                  name: "Ramin Səfərli",
                  role: "Personal trainer",
                  bio: "Works on strength training and barbell technique. Prefers to spend a beginner's first two weeks purely on learning the movements.",
                },
                {
                  name: "Aysel Muradlı",
                  role: "Group class coach",
                  bio: "Runs the functional and circuit sessions. The 45-minute morning groups are hers.",
                },
                {
                  name: "Elçin Nəbiyev",
                  role: "Boxing coach",
                  bio: "Bag and pad work, footwork. Runs a separate no-contact technique group for people with no experience.",
                },
                {
                  name: "Nurlana Həsənli",
                  role: "Yoga and mobility coach",
                  bio: "Leads the opening and closing sessions. Works on back and shoulder mobility with people who sit at a desk all day.",
                },
              ],
            },
            {
              type: "process",
              heading: "How the first day goes",
              subheading: "You never have to pay before seeing the place. The order is this:",
              items: [
                {
                  title: "Look around",
                  text: "Call ahead or just walk in and take a look. You see the timetable, the equipment and the changing rooms for yourself.",
                },
                {
                  title: "Trial session",
                  text: "One free trial session — any group class or an open-floor workout. Bring training clothes and water, that's it.",
                },
                {
                  title: "Talk about your goal",
                  text: "A 15-minute chat with a coach: what you want, any pain or limitation, how many days a week you actually have.",
                },
                {
                  title: "Pick a plan and start",
                  text: "You choose the plan that fits, we open the card at reception. You can train the same day.",
                },
              ],
            },
            {
              type: "gallery",
              heading: "The gym",
              items: [
                { imageUrl: "", caption: "Strength zone, ground floor" },
                { imageUrl: "", caption: "Free weights and racks" },
                { imageUrl: "", caption: "Functional training lane" },
                { imageUrl: "", caption: "Ring and bags" },
                { imageUrl: "", caption: "Cardio zone" },
                { imageUrl: "", caption: "Changing room" },
              ],
            },
            {
              type: "testimonials",
              heading: "What members say",
              items: [
                {
                  quote:
                    "I come in at 07:00 and never have to queue for a rack. That was the whole issue for me.",
                  author: "Kamran A.",
                  role: "Member, Morning plan",
                  rating: 5,
                },
                {
                  quote:
                    "I had never trained before. The coach stood next to me the first week and fixed the movement, so the nerves went away.",
                  author: "Səbinə M.",
                  role: "Member, group classes",
                  rating: 5,
                },
                {
                  quote:
                    "The boxing group treats newcomers differently. Nobody put me in the ring for the first month — we worked on technique.",
                  author: "Tural H.",
                  role: "Member, Full access + Boxing",
                  rating: 4,
                },
                {
                  quote:
                    "I froze my membership for a month while travelling and had no trouble coming back. The terms were explained up front.",
                  author: "Günel R.",
                  role: "Member, Full access",
                  rating: 5,
                },
              ],
            },
            {
              type: "faq",
              heading: "Frequently asked questions",
              items: [
                {
                  question: "Can I try a session before paying?",
                  answer:
                    "Yes. Everyone new gets one free trial session — a group class or an open-floor workout. Call ahead so a coach is expecting you.",
                },
                {
                  question: "How long is the contract?",
                  answer:
                    "The minimum term is one month. No annual or long-term commitment is required; you can continue month by month and stop renewing whenever you like. Paying 6 or 12 months up front is only for the discount, never a requirement.",
                },
                {
                  question: "Can I freeze my membership?",
                  answer:
                    "The Full access and Full access + Boxing plans include up to 30 freeze days per year, for travel, illness or a work trip. Tell reception or call before the freeze starts.",
                },
                {
                  question: "Are showers, lockers and towels available?",
                  answer:
                    "Yes, all three are included in every plan. Lockers are issued for the length of your workout; a permanent locker costs extra. Both changing rooms have showers.",
                },
                {
                  question: "Are group classes included in the membership?",
                  answer:
                    "The Full access plan includes all 48 weekly classes. The Morning plan includes only the classes between 06:30 and 16:00. Boxing groups sit in their own plan.",
                },
                {
                  question: "How much is personal training?",
                  answer:
                    "A block of 8 sessions is 240 ₼, 55 minutes each. Single sessions are also available. Personal training does not replace gym membership — it is added on top of it.",
                },
                {
                  question: "Is there an age limit?",
                  answer:
                    "From 16 you can sign up on your own. Ages 14 to 16 are accepted only with parental consent and under coach supervision. We do not issue memberships below 14.",
                },
              ],
            },
            {
              type: "hours",
              heading: "Opening hours",
              items: [
                { days: "Monday", hours: "06:30 – 23:00" },
                { days: "Tuesday", hours: "06:30 – 23:00" },
                { days: "Wednesday", hours: "06:30 – 23:00" },
                { days: "Thursday", hours: "06:30 – 23:00" },
                { days: "Friday", hours: "06:30 – 23:00" },
                { days: "Saturday", hours: "08:00 – 21:00" },
                { days: "Sunday", hours: "09:00 – 18:00" },
              ],
              note: "The group class timetable is posted at reception and at the entrance to the floor. Hours are shorter on public holidays; changes are announced a week in advance.",
            },
            {
              type: "contact",
              heading: "Come and see the floor",
              phone: PHONE,
              email: EMAIL,
              address: "1A Tabriz Street, Narimanov district, Baku",
            },
            {
              type: "cta",
              heading: "The trial session is free",
              subheading:
                "One call and we book a time that suits you; a coach meets you at the door. No payment, no commitment.",
              ctaText: "See the memberships",
              ctaUrl: "#qiymetler",
            },
          ],
        },
      ],
      footer: {
        text: "© Dəmirxana Fitness Club. This site is built with sample content.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp: " + MOBILE, href: "#" },
        ],
      },
    },

    /* ══════════════════════════════════════════════════════════════════════
       RU
       ═══════════════════════════════════════════════════════════════════ */
    ru: {
      design: "forge",
      siteName: "Dəmirxana",
      nav: [
        { label: "Занятия", href: "#xidmetler" },
        { label: "Абонементы", href: "#qiymetler" },
        { label: "Тренеры", href: "#komanda" },
        { label: "Вопросы", href: "#faq" },
        { label: "Контакты", href: "#elaqe" },
      ],
      pages: [
        {
          slug: "",
          title: "Главная",
          sections: [
            {
              type: "hero",
              heading: "Вес не врёт",
              subheading: "Фитнес-клуб Dəmirxana · Баку, Нариманов",
              ctaText: "Записаться на пробное",
              ctaUrl: "#elaqe",
            },
            {
              type: "stats",
              items: [
                { value: "48", label: "Групповых занятий в неделю" },
                { value: "1 400 м²", label: "Площадь зала" },
                { value: "120+", label: "Тренажёров и снарядов" },
                { value: "06:30–23:00", label: "Часы работы по будням" },
              ],
            },
            {
              type: "features",
              heading: "Что есть в зале",
              subheading:
                "Пять зон и одно расписание. В какую зону ни зайдёте, тренер рядом — спрашивайте про технику.",
              items: [
                {
                  title: "Свободные веса",
                  text: "Штанги, диски и стойки. Восемь силовых рам, у каждой свой комплект штанг, поэтому очередь к стойке почти не собирается.",
                },
                {
                  title: "Функциональный тренинг",
                  text: "Гири, кольца, канаты и дорожка для саней. Круговые тренировки по 45 минут есть и в утреннем, и в вечернем расписании.",
                },
                {
                  title: "Бокс и кикбоксинг",
                  text: "Отдельный ринг, шесть мешков и работа на лапах. Для новичков есть своя группа техники, опыт не нужен.",
                },
                {
                  title: "Кардиозона",
                  text: "Дорожки, гребные и лестничные тренажёры. На каждом есть выход, чтобы подключить свои наушники.",
                },
                {
                  title: "Йога и мобильность",
                  text: "Сессии на открытии утром и на закрытии вечером. Коврики и ремни выдаём в зале, приносить своё не обязательно.",
                },
                {
                  title: "Персональные тренировки",
                  text: "Работа один на один: программа, техника, план нагрузки. Занятие длится 55 минут, по предварительной записи.",
                },
              ],
            },
            {
              type: "about",
              heading: "Много железа, мало шума",
              body:
                "Dəmirxana открылась в 2019 году как небольшой силовой зал, а сейчас занимает два этажа в Наримановском районе. Правила простые: оборудование работает, в зале чисто, тренер рядом, когда вы спрашиваете. Никаких рекламных роликов, никакого «особого метода», никаких навязанных продаж — обычный зал с нормальным расписанием. Большинство тех, кто приходит впервые, никогда не занимались спортом, поэтому для них есть отдельные группы с медленным началом. Открываемся в 06:30, чтобы тренирующимся до работы не пришлось спешить, и работаем до 23:00, чтобы после смены никто не нашёл дверь закрытой.",
            },
            {
              type: "pricing",
              heading: "Абонементы",
              subheading:
                "Четыре варианта, без скрытых условий. Что входит и что не входит — написано под каждым.",
              items: [
                {
                  name: "Утренний",
                  price: "45 ₼",
                  unit: "в месяц",
                  desc: "Доступ по будням с 06:30 до 16:00. Для тех, кто тренируется утром или днём.",
                  features: [
                    "Полный доступ в силовую и кардиозону",
                    "Шкафчик, душ и полотенце включены",
                    "Групповые занятия утреннего расписания",
                    "Зона бокса не входит",
                    "Доступ по выходным не входит",
                  ],
                },
                {
                  name: "Полный доступ",
                  price: "70 ₼",
                  unit: "в месяц",
                  desc: "Доступ в течение всех часов работы, семь дней в неделю.",
                  features: [
                    "Все зоны без ограничения по времени",
                    "Все 48 групповых занятий в неделю",
                    "Шкафчик, душ и полотенце включены",
                    "Одна бесплатная консультация по технике в первую неделю",
                    "Право заморозить абонемент до 30 дней в год",
                    "Персональные тренировки оплачиваются отдельно",
                  ],
                  featured: true,
                },
                {
                  name: "Полный доступ + Бокс",
                  price: "95 ₼",
                  unit: "в месяц",
                  desc: "Всё из полного доступа плюс ринг, работа на мешках и все группы бокса.",
                  features: [
                    "Всё из абонемента «Полный доступ»",
                    "Все группы бокса и кикбоксинга",
                    "Свободное использование ринга вне расписания",
                    "Аренда перчаток и бинтов включена",
                    "Капа и шлем — свои",
                  ],
                },
                {
                  name: "Персональные тренировки",
                  price: "240 ₼",
                  unit: "8 занятий",
                  desc: "Один на один с тренером. Продаётся как дополнение к действующему абонементу.",
                  features: [
                    "8 занятий по 55 минут",
                    "Проверка движений и осанки на первом занятии",
                    "Письменная программа тренировок",
                    "Занятия действуют 3 месяца",
                    "Абонемент в зал в цену не входит",
                  ],
                },
              ],
              note: "Цены указаны при оплате за месяц. Открытие карты — единоразово 10 ₼. При оплате за 6 или 12 месяцев вперёд действует скидка — точную сумму уточните на ресепшене. Цены могут меняться; актуальный список размещён в клубе.",
            },
            {
              type: "team",
              heading: "Тренеры",
              subheading:
                "В каждую смену в зале минимум два тренера. Чтобы задать вопрос, не нужно покупать занятие.",
              items: [
                {
                  name: "Рамин Сафарли",
                  role: "Персональный тренер",
                  bio: "Работает с силовыми тренировками и техникой штанги. Первые две недели с новичком предпочитает посвятить только освоению движений.",
                },
                {
                  name: "Айсель Мурадлы",
                  role: "Тренер групповых занятий",
                  bio: "Ведёт функциональные и круговые тренировки. Утренние группы по 45 минут — на ней.",
                },
                {
                  name: "Эльчин Набиев",
                  role: "Тренер по боксу",
                  bio: "Работа на мешках и лапах, передвижения. Для тех, кто без опыта, ведёт отдельную группу техники без контакта.",
                },
                {
                  name: "Нурлана Гасанлы",
                  role: "Тренер по йоге и мобильности",
                  bio: "Ведёт сессии на открытии и закрытии. Занимается подвижностью спины и плеч с теми, кто целый день за столом.",
                },
              ],
            },
            {
              type: "process",
              heading: "Как проходит первый день",
              subheading: "Платить, не увидев зал, не нужно. Порядок такой:",
              items: [
                {
                  title: "Посмотрите зал",
                  text: "Позвоните или просто зайдите и осмотритесь. Расписание, оборудование и раздевалки видите своими глазами.",
                },
                {
                  title: "Пробная тренировка",
                  text: "Одна бесплатная пробная тренировка — любое групповое занятие или свободный зал. Нужны только форма и вода.",
                },
                {
                  title: "Разговор о цели",
                  text: "15 минут с тренером: чего хотите, есть ли боли и ограничения, сколько дней в неделю реально есть.",
                },
                {
                  title: "Выберите абонемент и начните",
                  text: "Выбираете подходящий вариант, карту открываем на ресепшене. Тренироваться можно в тот же день.",
                },
              ],
            },
            {
              type: "gallery",
              heading: "Зал",
              items: [
                { imageUrl: "", caption: "Силовая зона, первый этаж" },
                { imageUrl: "", caption: "Свободные веса и стойки" },
                { imageUrl: "", caption: "Дорожка функционального тренинга" },
                { imageUrl: "", caption: "Ринг и мешки" },
                { imageUrl: "", caption: "Кардиозона" },
                { imageUrl: "", caption: "Раздевалка" },
              ],
            },
            {
              type: "testimonials",
              heading: "Что говорят члены клуба",
              items: [
                {
                  quote:
                    "Прихожу в 07:00 и не стою в очереди к стойке. Для меня это был главный вопрос.",
                  author: "Камран А.",
                  role: "Абонемент «Утренний»",
                  rating: 5,
                },
                {
                  quote:
                    "Я никогда не занималась. Первую неделю тренер стоял рядом и правил движение, поэтому страх прошёл.",
                  author: "Сабина М.",
                  role: "Групповые занятия",
                  rating: 5,
                },
                {
                  quote:
                    "В группе бокса к новичкам относятся иначе. Первый месяц меня никто не выпускал на ринг — работали технику.",
                  author: "Турал Г.",
                  role: "Абонемент «Полный доступ + Бокс»",
                  rating: 4,
                },
                {
                  quote:
                    "Заморозила абонемент на месяц из-за поездки, вернулась без проблем. Условия объяснили заранее.",
                  author: "Гюнель Р.",
                  role: "Абонемент «Полный доступ»",
                  rating: 5,
                },
              ],
            },
            {
              type: "faq",
              heading: "Частые вопросы",
              items: [
                {
                  question: "Можно попробовать тренировку до оплаты?",
                  answer:
                    "Да. Каждому новому гостю мы даём одну бесплатную пробную тренировку — групповое занятие или свободный зал. Позвоните заранее, чтобы тренер вас ждал.",
                },
                {
                  question: "На какой срок заключается договор?",
                  answer:
                    "Минимальный срок — один месяц. Годовые и долгосрочные обязательства не нужны: можно продлевать месяц за месяцем и прекратить в любой момент. Оплата за 6 или 12 месяцев вперёд нужна только для скидки, это не требование.",
                },
                {
                  question: "Можно ли заморозить абонемент?",
                  answer:
                    "В абонементах «Полный доступ» и «Полный доступ + Бокс» есть до 30 дней заморозки в год — на поездку, болезнь или командировку. О заморозке нужно сообщить на ресепшене или по телефону до её начала.",
                },
                {
                  question: "Есть душ, шкафчики и полотенца?",
                  answer:
                    "Да, всё это входит во все абонементы. Шкафчик выдаётся на время тренировки; постоянный шкафчик — за отдельную плату. Душевые есть в обеих раздевалках.",
                },
                {
                  question: "Групповые занятия входят в стоимость абонемента?",
                  answer:
                    "В «Полный доступ» входят все 48 занятий в неделю. В «Утренний» — только те, что проходят с 06:30 до 16:00. Группы бокса относятся к отдельному абонементу.",
                },
                {
                  question: "Сколько стоит персональная тренировка?",
                  answer:
                    "Блок из 8 занятий — 240 ₼, каждое по 55 минут. Можно взять и одно занятие. Персональные тренировки не заменяют абонемент, а добавляются к нему.",
                },
                {
                  question: "Есть ли ограничение по возрасту?",
                  answer:
                    "С 16 лет можно записаться самостоятельно. С 14 до 16 лет — только с согласия родителей и под наблюдением тренера. Абонементы младше 14 лет мы не оформляем.",
                },
              ],
            },
            {
              type: "hours",
              heading: "Часы работы",
              items: [
                { days: "Понедельник", hours: "06:30 – 23:00" },
                { days: "Вторник", hours: "06:30 – 23:00" },
                { days: "Среда", hours: "06:30 – 23:00" },
                { days: "Четверг", hours: "06:30 – 23:00" },
                { days: "Пятница", hours: "06:30 – 23:00" },
                { days: "Суббота", hours: "08:00 – 21:00" },
                { days: "Воскресенье", hours: "09:00 – 18:00" },
              ],
              note: "Расписание групповых занятий размещено на ресепшене и у входа в зал. В государственные праздники часы работы сокращаются; об изменениях сообщаем за неделю.",
            },
            {
              type: "contact",
              heading: "Приходите посмотреть зал",
              phone: PHONE,
              email: EMAIL,
              address: "Баку, Наримановский район, улица Тебриз 1A",
            },
            {
              type: "cta",
              heading: "Пробная тренировка бесплатна",
              subheading:
                "Один звонок — подбираем удобное время, тренер встречает вас у входа. Без оплаты и без обязательств.",
              ctaText: "Посмотреть абонементы",
              ctaUrl: "#qiymetler",
            },
          ],
        },
      ],
      footer: {
        text: "© Фитнес-клуб Dəmirxana. Сайт собран на демонстрационном контенте.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp: " + MOBILE, href: "#" },
        ],
      },
    },
  },
};
