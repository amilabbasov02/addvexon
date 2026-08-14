/**
 * "atlas" dizaynı üçün nümunə məzmun — korporativ / peşəkar xidmətlər.
 *
 * Seçilmiş sahə: mühasibatlıq və vergi konsaltinq praktikası (Bakı).
 * Şirkət uydurmadır — real biznes deyil. Telefon nömrələri, e-poçt və ünvan
 * nümunə üçündür. Lisenziya, sertifikat, təsis ili və müştəri sayı kimi
 * yoxlanıla bilən "etibar rəqəmləri" qəsdən yazılmır: nümunə məzmun heç vaxt
 * mövcud olmayan səlahiyyət iddiası etməməlidir.
 *
 * Şəkillər (`imageUrl`) ayrıca mərhələdə doldurulur — burada qəsdən yoxdur.
 * Logo bölməsi şəkil olmayanda adları mətn kimi göstərir, bizə də bu lazımdır.
 */
import type { LocalizedBundle, SiteTheme } from "../../src/lib/site-content";

// ── Tema ────────────────────────────────────────────────────────────────────
// Atlas vurğu rəngini yalnız dörd yerdə işlədir (logo kvadratı, CTA düymələri,
// proses nömrələri, ikonlar) — ona görə bir dərin, sakit ton seçilir. Fon isti
// kağız çalarındadır, mətn isə tam qara deyil: ekran işığında gözü az yorur.
export const atlasTheme: SiteTheme = {
  colors: {
    primary: "#16453C",
    bg: "#FBFAF8",
    surface: "#F1EFEA",
    text: "#16191B",
    muted: "#63696C",
  },
  fonts: {
    heading: "Archivo, sans-serif",
    body: "Inter, sans-serif",
  },
};

// ── Sabit dəyərlər (bütün dillərdə eynidir) ─────────────────────────────────
const PHONE = "+994 12 000 00 00";
const EMAIL = "salam@qapankonsalt.az";
const SITE_NAME = "Qapan Konsalt";

/** Partnyor/müştəri adları uydurmadır və dildən dilə tərcümə olunmur. */
const PARTNERS = [
  { name: "Zərif Tekstil MMC" },
  { name: "Yolbar Logistika" },
  { name: "Kubmet Metal Emalı" },
  { name: "Mərcan Tibb Ləvazimatları" },
  { name: "Ustad Tikinti Servis" },
  { name: "Aynur Aqro MMC" },
];

// ── Məzmun ──────────────────────────────────────────────────────────────────
export const atlasContent: LocalizedBundle = {
  defaultLocale: "az",
  locales: {
    // ════════════════════════════════════════════════════════════════════════
    //  AZ
    // ════════════════════════════════════════════════════════════════════════
    az: {
      design: "atlas",
      siteName: SITE_NAME,
      nav: [
        { label: "Xidmətlər", href: "#xidmetler" },
        { label: "Haqq cədvəli", href: "#qiymetler" },
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
              heading: "Mühasibatlıq, vergi və əmək haqqı — bir komandada",
              subheading:
                "Qapan Konsalt Bakıda fəaliyyət göstərən mühasibat və vergi konsaltinq praktikasıdır. Kiçik və orta şirkətlərin gündəlik uçotunu aparır, hesabatlarını vaxtında təqdim edir və ay bağlananda rəqəmləri sadə dillə izah edirik.",
              ctaText: "Pulsuz konsultasiya",
              ctaUrl: "#elaqe",
            },
            {
              type: "features",
              heading: "Xidmət istiqamətlərimiz",
              subheading:
                "Hər istiqamət ayrıca da sifariş oluna bilər. Şirkətlər çox vaxt aylıq uçotdan başlayır, sonra əmək haqqı və idarəetmə hesabatlığını da bizə həvalə edir.",
              items: [
                {
                  title: "Mühasibat uçotunun aparılması",
                  icon: "calculate",
                  text: "Gündəlik əməliyyatların uçotu: bank çıxarışları, kassa, mal-material hərəkəti, debitor və kreditor hesablaşmaları. Uçotu 1C-də və ya sizin istifadə etdiyiniz proqramda aparırıq; ay bağlananda dövriyyə cədvəlini və balansı təhvil veririk.",
                },
                {
                  title: "Vergi hesabatlarının hazırlanması və təqdimi",
                  icon: "receipt_long",
                  text: "Mənfəət, sadələşdirilmiş vergi, ƏDV və muzdlu işlə əlaqədar hesabatların hazırlanması, elektron qaydada göndərilməsi. Göndərməzdən əvvəl rəqəmləri sizinlə birlikdə nəzərdən keçiririk — məqsəd sonradan dəqiqləşdirilmiş hesabata ehtiyac qalmamasıdır.",
                },
                {
                  title: "ƏDV və elektron qaimə əməliyyatları",
                  icon: "description",
                  text: "Elektron qaimə-fakturaların yazılması və qəbulu, əvəzləşdirmənin izlənməsi, alış-satış registrlərinin uyğunlaşdırılması. Qaimələrdəki uyğunsuzluğu vaxtında görmək bir çox halda ən çox vəsait qoruyan işdir.",
                },
                {
                  title: "Əmək haqqı və kadr sənədləşməsi",
                  icon: "badge",
                  text: "Əmək haqqının hesablanması, tutulmalar, məzuniyyət və xəstəlik günlərinin sayılması, əmək müqavilələrinin elektron sistemdə qeydiyyatı. İşçilərə paylanacaq aylıq hesablama vərəqələrini də biz hazırlayırıq.",
                },
                {
                  title: "Şirkətin qeydiyyatı və uçotun qurulması",
                  icon: "domain",
                  text: "Yeni MMC və fərdi sahibkarların qeydiyyat sənədləri, ilkin sənəd dövriyyəsinin qurulması, hesab planı və uçot siyasətinin yazılması. Sıfırdan başlayan şirkət ilk ayın sonunda hansı hesabatı kimə verəcəyini dəqiq bilir.",
                },
                {
                  title: "Maliyyə və idarəetmə hesabatlığı",
                  icon: "insights",
                  text: "Rəhbərlik üçün aylıq gəlir-xərc, pul vəsaitlərinin hərəkəti və debitor borcları hesabatları. Bunlar vergi hesabatından fərqlidir: qərar vermək üçündür, ona görə sizin biznesin dilində və sizin bölmələriniz üzrə qurulur.",
                },
              ],
            },
            {
              type: "stats",
              items: [
                { value: "6", label: "xidmət istiqaməti" },
                { value: "3", label: "iş dili: Azərbaycan, ingilis, rus" },
                { value: "1 iş günü", label: "yazılı sorğulara cavab müddəti" },
                { value: "20", label: "hər ayın 20-nə qədər aylıq hesabat hazır olur" },
              ],
            },
            {
              type: "about",
              heading: "Kiçik komanda, aydın məsuliyyət",
              body:
                "Qapan Konsalt kiçik praktikadır və belə qalmağı seçir. Hər müştəriyə bir əsas mühasib təhkim olunur — telefonu götürən adam sizin sənədlərinizi görən adamdır. Bu, böyük şirkətlərdə itən əlaqəni saxlayır.\n\nİşimizin çox hissəsi ticarət, xidmət, logistika və kiçik istehsal sahələrindəki şirkətlərlədir. Bu sahələrin sənəd dövriyyəsi bir-birinə oxşayır, ona görə də ilk aydan hansı yerdə problem çıxacağını təxmin edə bilirik.\n\nBir şeyi əvvəldən deyirik: uçotu qaydaya salmaq bəzən xoşagəlməz söhbətdən başlayır — keçmiş dövrlərdə çatışmayan sənəd, yazılmamış qaimə, rəsmiləşdirilməmiş işçi. Bunları gizlətmirik, siyahı hazırlayır və birlikdə ardıcıllıqla bağlayırıq.",
            },
            {
              type: "process",
              heading: "İş necə qurulur",
              subheading:
                "İlk zəngdən aylıq iş rejiminə keçid adətən bir-iki həftə çəkir. Hər addımda nəyin gözlənildiyi yazılı şəkildə təsdiqlənir.",
              items: [
                {
                  title: "İlk söhbət",
                  text: "30 dəqiqəlik ödənişsiz görüş — onlayn və ya ofisdə. Fəaliyyət növünüzü, işçi sayını, vergi rejimini və indiki uçotun kim tərəfindən aparıldığını danışırıq. Bu mərhələdə heç bir sənəd tələb olunmur.",
                },
                {
                  title: "Sənədlərin nəzərdən keçirilməsi",
                  text: "Son bir-iki hesabat dövrünə baxırıq: təqdim olunmuş hesabatlar, qaimə registrləri, əmək müqavilələri. Nəticədə çatışmayan və düzəldilməli məsələlərin siyahısını alırsınız — bu siyahı bizimlə işləməsəniz də sizdə qalır.",
                },
                {
                  title: "Təklif və müqavilə",
                  text: "İş həcmi, aylıq haqq, təhvil müddətləri və kimin nəyə cavabdeh olduğu bir səhifədə yazılır. Müqavilə imzalanmadan iş başlamır, imzalandıqdan sonra qiymət razılaşdırılmış dövr üçün dəyişmir.",
                },
                {
                  title: "Uçotun qurulması və təhvil",
                  text: "Proqramda hesab planını qururuq, açılış qalıqlarını daxil edirik, sənədlərin bizə hansı formada və hansı tarixə qədər çatacağını təyin edirik. Əvvəlki mühasibdən sənəd təhvilində də iştirak edirik.",
                },
                {
                  title: "Aylıq iş rejimi",
                  text: "Ay ərzində sənədləri qəbul edir və uçota alırıq; ayın 20-nə qədər hesabatlar hazır olur; hesabat göndərilməzdən əvvəl sizinlə qısa təsdiq görüşü keçiririk. Rüb sonunda isə rəqəmləri izah edən yığcam hesabat veririk.",
                },
              ],
            },
            {
              type: "team",
              heading: "Kimlə işləyəcəksiniz",
              subheading:
                "İşinizi konkret adamlar aparır. Əsas mühasib məzuniyyətdə olanda əvəzedici mühasib əvvəlcədən təyin edilir, sənədləriniz gözləmədə qalmır.",
              items: [
                {
                  name: "Nərmin Əliyeva",
                  role: "Təsisçi, baş mühasib",
                  bio: "Mühasibat uçotu və vergi hesabatlığı istiqamətini aparır. Ticarət və xidmət sahəsindən olan şirkətlərlə işləyir, uçot siyasətinin yazılması onun cavabdehliyindədir.",
                },
                {
                  name: "Rəşad Hüseynov",
                  role: "Vergi üzrə məsləhətçi",
                  bio: "Vergi rejiminin seçilməsi, hesabatların yoxlanışı və vergi orqanı ilə yazışmalar üzrə çalışır. Mürəkkəb sualları izah edərkən qısa yazmağı sevir.",
                },
                {
                  name: "Aygün Məmmədova",
                  role: "Əmək haqqı və kadr uçotu üzrə mütəxəssis",
                  bio: "Əmək haqqı hesablamaları, məzuniyyət və xəstəlik günləri, əmək müqavilələrinin elektron qeydiyyatı ilə məşğuldur. Aylıq hesablama vərəqələrini hazırlayır.",
                },
                {
                  name: "Elçin Qasımov",
                  role: "Mühasib — ƏDV və qaimə əməliyyatları",
                  bio: "Elektron qaimə-fakturalar, əvəzləşdirmə və registrlərin uyğunlaşdırılması üzrə gündəlik işi aparır. Müştərilərlə sənəd axınının cari əlaqəsini o saxlayır.",
                },
              ],
            },
            {
              type: "pricing",
              heading: "Haqq cədvəli",
              subheading:
                "Qiymətə nəyin daxil olduğunu əvvəlcədən görməyiniz üçün əsas xidmətləri açıq yazırıq. Yekun məbləğ əməliyyatların sayı, işçi sayı və vergi rejiminə görə formalaşır.",
              items: [
                {
                  name: "İlkin konsultasiya",
                  price: "Ödənişsiz",
                  unit: "30 dəqiqə",
                  desc:
                    "Vəziyyətinizi dinləyirik, hansı hesabatların kimə və hansı müddətdə verildiyini izah edirik. Sonrakı əməkdaşlıq üçün heç bir öhdəlik yaranmır.",
                  features: [
                    "Onlayn və ya ofisdə",
                    "Azərbaycan, ingilis və ya rus dilində",
                    "Sənəd tələb olunmur",
                  ],
                },
                {
                  name: "Aylıq mühasibat xidməti",
                  price: "250 ₼-dən",
                  unit: "aylıq",
                  desc:
                    "Kiçik şirkət üçün tam dəst: gündəlik uçot, vergi hesabatlarının hazırlanması və təqdimi, ay bağlanışı və rüblük izahlı hesabat. Əməliyyat sayı artdıqca haqq da mərhələli şəkildə dəyişir.",
                  featured: true,
                  features: [
                    "Gündəlik uçot və ay bağlanışı",
                    "Vergi hesabatlarının təqdimi",
                    "Elektron qaimə əməliyyatları",
                    "Bir əsas mühasib və əvəzedici",
                    "Ayın 20-nə qədər hesabat hazır",
                    "Rüblük izahlı hesabat",
                  ],
                },
                {
                  name: "Əmək haqqı hesablanması",
                  price: "8 ₼-dən",
                  unit: "bir işçi / aylıq",
                  desc:
                    "Hesablamalar, tutulmalar, məzuniyyət və xəstəlik günləri, hesablama vərəqələri. Əmək müqavilələrinin elektron qeydiyyatı da bu xidmətə daxildir.",
                  features: [
                    "Aylıq hesablama vərəqələri",
                    "Müqavilələrin elektron qeydiyyatı",
                    "Minimum aylıq həcm: 5 işçi",
                  ],
                },
                {
                  name: "Saatlıq məsləhət",
                  price: "60 ₼",
                  unit: "saat",
                  desc:
                    "Bir konkret sual üçün: vergi rejiminin seçimi, keçmiş hesabatın yoxlanışı, müqavilə şərtlərinin uçota təsiri. Vaxt 15 dəqiqəlik intervallarla hesablanır.",
                  features: ["Yazılı qısa nəticə", "15 dəqiqəlik hesablama", "Aylıq müqavilə tələb olunmur"],
                },
                {
                  name: "Şirkətin qeydiyyatı və uçotun qurulması",
                  price: "400 ₼-dən",
                  unit: "birdəfəlik",
                  desc:
                    "Qeydiyyat sənədlərinin hazırlanması, hesab planının qurulması, uçot siyasətinin yazılması və ilkin sənəd dövriyyəsinin təyin edilməsi. Dövlət rüsumları bu məbləğə daxil deyil.",
                  features: [
                    "Sənədlərin hazırlanması",
                    "Uçot siyasəti və hesab planı",
                    "İlk ayın uçotu daxildir",
                  ],
                },
              ],
              note:
                "Göstərilən məbləğlər ilkin təsəvvür üçündür və öhdəlik yaratmır. Dəqiq haqq sənəd həcmi, əməliyyat sayı, işçi sayı, vergi rejimi və hesabat dövrünün vəziyyətinə görə hesablanır və müqavilədə yazılır. Keçmiş dövrlərin bərpası ayrıca qiymətləndirilir.",
            },
            {
              type: "logos",
              heading: "Birlikdə işlədiyimiz sahələrdən nümunələr",
              items: PARTNERS,
            },
            {
              type: "testimonials",
              heading: "Müştərilər nə deyir",
              items: [
                {
                  quote:
                    "Ən çox dəyər verdiyim şey hesabat göndərilməzdən əvvəlki qısa görüşdür. Rəqəmi görürəm, sualımı verirəm, sonra göndərilir. Əvvəllər hesabatı yalnız təqdim olunandan sonra görürdüm.",
                  author: "Kamran Səfərov",
                  role: "Direktor, ticarət şirkəti",
                  rating: 5,
                },
                {
                  quote:
                    "Keçmiş iki ilin sənədləri qarışıq idi. Siyahı verdilər, ardıcıllıqla bağladıq, heç kim məni günahlandırmadı. Bu proses üç ay çəkdi və hər ay nə qədər qaldığını bilirdim.",
                  author: "Lalə Rəhimova",
                  role: "Təsisçi, xidmət sahəsi",
                  rating: 5,
                },
                {
                  quote:
                    "İşçi sayımız 40-a çatanda əmək haqqı hesablanması bizim üçün ağır oldu. Bu istiqaməti onlara verdik. Hesablama vərəqələri vaxtında gəlir, işçilərin sualı azaldı.",
                  author: "Tural Bağırov",
                  role: "Əməliyyat direktoru, logistika",
                  rating: 4,
                },
                {
                  quote:
                    "Şirkəti sıfırdan qeydiyyata aldılar və ilk ayın uçotunu da qurdular. Mənə bir səhifəlik cədvəl verdilər: hansı sənədi hansı tarixə qədər göndərməliyəm. Onu hələ də divarda saxlayıram.",
                  author: "Günel Nəbiyeva",
                  role: "Sahibkar, kiçik istehsal",
                  rating: 5,
                },
              ],
            },
            {
              type: "faq",
              heading: "Tez-tez verilən suallar",
              subheading:
                "Cavabı burada olmayan sual varsa, yazın — telefonda və ya e-poçtla konkret cavab veririk.",
              items: [
                {
                  question: "Qiymət necə müəyyən olunur?",
                  answer:
                    "Aylıq haqq dörd amilə baxılaraq hesablanır: ay ərzindəki sənəd və əməliyyat sayı, işçi sayı, vergi rejimi və hesabatların indiki vəziyyəti. İlk söhbətdən sonra sizə bir aralıq deyirik, sənədlərə baxandan sonra isə dəqiq məbləği yazılı təklifdə göstəririk. Cədvəldəki rəqəmlər başlanğıc nöqtəsidir, son qiymət deyil.",
                },
                {
                  question: "Nə qədər vaxt aparır?",
                  answer:
                    "İlk söhbətdən aylıq iş rejiminə keçid adətən bir-iki həftədir: sənədlərin nəzərdən keçirilməsi 3–5 iş günü, müqavilə və uçotun qurulması bir həftəyə qədər. Cari hesabat dövründə hesabatlar hər ayın 20-nə qədər hazır olur. Keçmiş dövrlərin bərpası daha uzun çəkir — həcmə görə bir aydan üç aya qədər, və başlamazdan əvvəl müddəti sizə deyirik.",
                },
                {
                  question: "Kimlə işləyəcəyəm?",
                  answer:
                    "Sizə bir əsas mühasib təhkim olunur və gündəlik yazışma onunla gedir. Vergi ilə bağlı mürəkkəb suallar məsləhətçiyə keçir, əmək haqqı isə ayrıca mütəxəssisdə olur. Əsas mühasib məzuniyyətdə və ya xəstə olanda əvəzedici əvvəlcədən təyin edilir — hər dəfə işi yenidən izah etməyə ehtiyac qalmır.",
                },
                {
                  question: "İş həcmi razılaşdırılandan çox olarsa nə olur?",
                  answer:
                    "Həcm müqavilədə əməliyyat və işçi sayı ilə yazılır. Faktiki göstərici razılaşdırılmış həddi iki ay ardıcıl aşarsa, sizə xəbər verib yeni haqqı təklif edirik; siz razılaşana qədər köhnə şərtlər qüvvədə qalır. Birdəfəlik artımlar üçün (məsələn mövsümi satış) əlavə haqq tutmuruq.",
                },
                {
                  question: "Kiçik şirkətlərlə və fərdi sahibkarlarla işləyirsinizmi?",
                  answer:
                    "Bəli, işimizin əsas hissəsi məhz kiçik şirkətlər və fərdi sahibkarlardır. Bir işçisi olan fərdi sahibkar üçün də, 50 işçili şirkət üçün də ayrıca iş rejimi qururuq. Minimum aylıq həcm yalnız əmək haqqı xidmətində var (5 işçi), digər xidmətlərdə yoxdur.",
                },
                {
                  question: "Müqavilə və ödəniş şərtləri necədir?",
                  answer:
                    "Yazılı müqavilə imzalanır; ilkin müddət üç aydır, sonra müddətsiz davam edir. Ödəniş hər ay üçün ayın ilk beş günündə bank köçürməsi ilə edilir və elektron qaimə verilir. Xitam bir ay əvvəldən yazılı bildirişlə mümkündür — bu halda sənədləri və uçot bazasını təhvil vermək bizim öhdəliyimizdir və əlavə ödənişsizdir.",
                },
              ],
            },
            {
              type: "hours",
              heading: "İş saatları",
              items: [
                { days: "Bazar ertəsi", hours: "09:00 – 18:00" },
                { days: "Çərşənbə axşamı", hours: "09:00 – 18:00" },
                { days: "Çərşənbə", hours: "09:00 – 18:00" },
                { days: "Cümə axşamı", hours: "09:00 – 18:00" },
                { days: "Cümə", hours: "09:00 – 17:00" },
                { days: "Şənbə", hours: "10:00 – 14:00" },
                { days: "Bazar", hours: "Bağlıdır" },
              ],
              note:
                "Şənbə günü yalnız hesabat dövrlərində növbətçi mühasib işləyir — gəlməzdən əvvəl zəng edin. E-poçtla göndərilən sorğulara bir iş günü içində cavab veririk.",
            },
            {
              type: "contact",
              heading: "Əlaqə",
              phone: PHONE,
              email: EMAIL,
              address: "Bakı, Nəsimi rayonu, Cəfər Cabbarlı küçəsi, ofis mərkəzi, 4-cü mərtəbə",
            },
            {
              type: "cta",
              heading: "Uçotunuza kənardan bir baxış lazımdır?",
              subheading:
                "30 dəqiqəlik ödənişsiz söhbətdən sonra hansı sənədlərin çatışmadığını və növbəti addımın nə olduğunu bilirsiniz. Öhdəlik yaranmır.",
              ctaText: "Görüş təyin edin",
              ctaUrl: "#elaqe",
            },
          ],
        },
      ],
      footer: {
        text: "© Qapan Konsalt MMC — Bakı, Azərbaycan. Bu sayt nümunə məzmunla doldurulmuşdur.",
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  EN
    // ════════════════════════════════════════════════════════════════════════
    en: {
      design: "atlas",
      siteName: SITE_NAME,
      nav: [
        { label: "Services", href: "#xidmetler" },
        { label: "Fee schedule", href: "#qiymetler" },
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
              heading: "Accounting, tax and payroll under one roof",
              subheading:
                "Qapan Konsalt is an accounting and tax consulting practice based in Baku. We keep the day-to-day books for small and mid-sized companies, file their returns on time, and explain the numbers in plain language at month end.",
              ctaText: "Free consultation",
              ctaUrl: "#elaqe",
            },
            {
              type: "features",
              heading: "What we do",
              subheading:
                "Each service line can be engaged on its own. Most companies start with monthly bookkeeping and later hand over payroll and management reporting as well.",
              items: [
                {
                  title: "Day-to-day bookkeeping",
                  icon: "calculate",
                  text: "Bank statements, cash, inventory movements, receivables and payables, all recorded as they happen. We work in 1C or in the system you already use, and hand over a trial balance and balance sheet when the month closes.",
                },
                {
                  title: "Preparing and filing tax returns",
                  icon: "receipt_long",
                  text: "Profit tax, simplified tax, VAT and employment-related returns prepared and filed electronically. We review the figures with you before anything is submitted — the goal is to avoid amended returns later.",
                },
                {
                  title: "VAT and e-invoice handling",
                  icon: "description",
                  text: "Issuing and accepting electronic invoices, tracking input VAT credit, reconciling purchase and sales registers. Catching a mismatched invoice in the same month is often the single most valuable thing we do.",
                },
                {
                  title: "Payroll and HR paperwork",
                  icon: "badge",
                  text: "Payroll calculation, deductions, leave and sick-day tracking, registration of employment contracts in the electronic system. We also prepare the monthly payslips you hand to staff.",
                },
                {
                  title: "Company registration and setting up the books",
                  icon: "domain",
                  text: "Registration paperwork for new LLCs and sole traders, a working document flow, a chart of accounts and a written accounting policy. A company starting from zero knows exactly what it files, to whom, at the end of its first month.",
                },
                {
                  title: "Financial and management reporting",
                  icon: "insights",
                  text: "Monthly income and expense, cash movement and receivables reports for the owner. These are not tax filings: they exist to support decisions, so we build them around your business lines and your vocabulary.",
                },
              ],
            },
            {
              type: "stats",
              items: [
                { value: "6", label: "service lines" },
                { value: "3", label: "working languages: Azerbaijani, English, Russian" },
                { value: "1 business day", label: "response time for written enquiries" },
                { value: "20", label: "monthly reporting ready by the 20th of each month" },
              ],
            },
            {
              type: "about",
              heading: "A small team with clear ownership",
              body:
                "Qapan Konsalt is a small practice and intends to stay one. Every client is assigned a lead accountant — the person who answers the phone is the person who sees your documents. That keeps the thread that usually gets lost in larger firms.\n\nMost of our work is with trading, services, logistics and light manufacturing companies. Their paperwork looks broadly similar, which means we can usually predict from the first month where the trouble will appear.\n\nOne thing we say upfront: cleaning up a set of books often starts with an uncomfortable conversation — missing documents from earlier periods, invoices never issued, staff never put on contract. We do not hide any of it. We write the list down and close the items with you, in order.",
            },
            {
              type: "process",
              heading: "How an engagement runs",
              subheading:
                "Moving from the first call to a steady monthly rhythm usually takes one to two weeks. What is expected at each step is confirmed in writing.",
              items: [
                {
                  title: "First conversation",
                  text: "A free 30-minute meeting, online or at our office. We go through what you do, how many people you employ, your tax regime and who keeps the books today. No documents are required at this stage.",
                },
                {
                  title: "Review of your records",
                  text: "We look at the last one or two reporting periods: filed returns, invoice registers, employment contracts. You receive a written list of what is missing and what needs correcting — that list is yours to keep whether or not you engage us.",
                },
                {
                  title: "Proposal and engagement letter",
                  text: "Scope, monthly fee, delivery dates and who is responsible for what, all on one page. Work does not start before signature, and once signed the fee stays fixed for the agreed period.",
                },
                {
                  title: "Setting up and handover",
                  text: "We build the chart of accounts, enter opening balances and agree how and by when documents reach us. We also take part in the handover from your previous accountant.",
                },
                {
                  title: "The monthly rhythm",
                  text: "Documents come in and are recorded through the month; reporting is ready by the 20th; we hold a short confirmation call before anything is filed. At the end of each quarter you get a short report that explains the figures.",
                },
              ],
            },
            {
              type: "team",
              heading: "Who you will be working with",
              subheading:
                "Named people do the work. When your lead accountant is on leave a backup is assigned in advance, so your paperwork does not sit and wait.",
              items: [
                {
                  name: "Nərmin Əliyeva",
                  role: "Founder, lead accountant",
                  bio: "Runs the bookkeeping and tax reporting line. Works with trading and services companies; writing the accounting policy sits with her.",
                },
                {
                  name: "Rəşad Hüseynov",
                  role: "Tax adviser",
                  bio: "Handles the choice of tax regime, review of filed returns and correspondence with the tax authority. Prefers to keep written explanations short.",
                },
                {
                  name: "Aygün Məmmədova",
                  role: "Payroll and HR records specialist",
                  bio: "Payroll calculations, leave and sick days, registration of employment contracts in the electronic system. Prepares the monthly payslips.",
                },
                {
                  name: "Elçin Qasımov",
                  role: "Accountant — VAT and invoicing",
                  bio: "Day-to-day work on electronic invoices, input VAT credit and register reconciliation. Keeps the running document flow with clients moving.",
                },
              ],
            },
            {
              type: "pricing",
              heading: "Fee schedule",
              subheading:
                "We publish the main service lines so you can see what is included before you call. The final figure depends on transaction volume, headcount and tax regime.",
              items: [
                {
                  name: "Initial consultation",
                  price: "No charge",
                  unit: "30 minutes",
                  desc:
                    "We listen to your situation and set out which returns are due, to whom and by when. No commitment to anything further.",
                  features: [
                    "Online or at our office",
                    "In Azerbaijani, English or Russian",
                    "No documents needed",
                  ],
                },
                {
                  name: "Monthly accounting service",
                  price: "from 250 ₼",
                  unit: "per month",
                  desc:
                    "The full set for a small company: day-to-day bookkeeping, preparation and filing of tax returns, month-end close and a quarterly report with commentary. The fee steps up as transaction volume grows.",
                  featured: true,
                  features: [
                    "Bookkeeping and month-end close",
                    "Filing of tax returns",
                    "Electronic invoice handling",
                    "A lead accountant plus a backup",
                    "Reporting ready by the 20th",
                    "Quarterly report with commentary",
                  ],
                },
                {
                  name: "Payroll processing",
                  price: "from 8 ₼",
                  unit: "per employee / month",
                  desc:
                    "Calculations, deductions, leave and sick days, payslips. Registration of employment contracts in the electronic system is included.",
                  features: [
                    "Monthly payslips",
                    "Electronic contract registration",
                    "Minimum monthly volume: 5 employees",
                  ],
                },
                {
                  name: "Advice by the hour",
                  price: "60 ₼",
                  unit: "per hour",
                  desc:
                    "For one specific question: choosing a tax regime, reviewing a filed return, the accounting effect of a contract clause. Time is counted in 15-minute increments.",
                  features: ["Short written conclusion", "15-minute increments", "No monthly contract required"],
                },
                {
                  name: "Company registration and setup",
                  price: "from 400 ₼",
                  unit: "one-off",
                  desc:
                    "Registration paperwork, chart of accounts, a written accounting policy and an agreed document flow. State fees are not included in this figure.",
                  features: [
                    "Paperwork prepared",
                    "Accounting policy and chart of accounts",
                    "First month of bookkeeping included",
                  ],
                },
              ],
              note:
                "The figures above are indicative and do not constitute an offer. The actual fee is calculated from document volume, transaction count, headcount, tax regime and the current state of your reporting, and is set out in the engagement letter. Restoring earlier periods is quoted separately.",
            },
            {
              type: "logos",
              heading: "Examples of the sectors we work in",
              items: PARTNERS,
            },
            {
              type: "testimonials",
              heading: "What clients say",
              items: [
                {
                  quote:
                    "The short call before filing is what I value most. I see the number, I ask my question, then it goes out. Previously I only ever saw a return after it had been submitted.",
                  author: "Kamran Səfərov",
                  role: "Director, trading company",
                  rating: 5,
                },
                {
                  quote:
                    "Two years of records were a mess. They gave me a list, we closed it item by item, and nobody made me feel blamed. It took three months and I always knew how much was left.",
                  author: "Lalə Rəhimova",
                  role: "Founder, services business",
                  rating: 5,
                },
                {
                  quote:
                    "When we reached 40 employees payroll became too heavy for us. We handed that line over. Payslips arrive on time and questions from staff have dropped.",
                  author: "Tural Bağırov",
                  role: "Operations director, logistics",
                  rating: 4,
                },
                {
                  quote:
                    "They registered the company from scratch and set up the first month of bookkeeping. I got a one-page table: which document to send, by which date. It is still on my wall.",
                  author: "Günel Nəbiyeva",
                  role: "Owner, light manufacturing",
                  rating: 5,
                },
              ],
            },
            {
              type: "faq",
              heading: "Frequently asked questions",
              subheading:
                "If your question is not answered here, write to us — we will give you a specific answer by phone or email.",
              items: [
                {
                  question: "How is the price decided?",
                  answer:
                    "The monthly fee is built from four things: the number of documents and transactions in a month, headcount, tax regime and the current state of your reporting. After the first conversation we give you a range; once we have seen the records we put an exact figure in a written proposal. The numbers in the schedule are a starting point, not a final price.",
                },
                {
                  question: "How long does it take?",
                  answer:
                    "Getting from the first conversation to a steady monthly rhythm normally takes one to two weeks: 3–5 business days to review the records, up to a week for the engagement letter and setup. In a current period, reporting is ready by the 20th of each month. Restoring earlier periods takes longer — one to three months depending on volume, and we tell you the timeframe before starting.",
                },
                {
                  question: "Who will I be working with?",
                  answer:
                    "You are assigned a lead accountant and your day-to-day correspondence goes through that person. Complex tax questions move to the adviser, and payroll sits with a separate specialist. When your lead accountant is on leave or ill, a named backup is assigned in advance, so you never have to explain your business again from the start.",
                },
                {
                  question: "What happens if the workload exceeds what we agreed?",
                  answer:
                    "Scope is written into the engagement letter as a transaction count and headcount. If the actual figures exceed the agreed band two months in a row, we tell you and propose a new fee; the old terms stay in force until you agree to it. One-off spikes, such as a seasonal peak, are not charged extra.",
                },
                {
                  question: "Do you work with small companies and sole traders?",
                  answer:
                    "Yes — small companies and sole traders are the core of our work. We set up a working rhythm for a sole trader with one employee just as we do for a company with fifty. The only minimum volume applies to payroll (5 employees); the other services have none.",
                },
                {
                  question: "What are the contract and payment terms?",
                  answer:
                    "There is a written engagement letter; the initial term is three months, after which it continues open-ended. Payment is by bank transfer within the first five days of each month and we issue an electronic invoice. Either side may terminate with one month's written notice — in that case handing over your documents and accounting database is our obligation and carries no extra charge.",
                },
              ],
            },
            {
              type: "hours",
              heading: "Office hours",
              items: [
                { days: "Monday", hours: "09:00 – 18:00" },
                { days: "Tuesday", hours: "09:00 – 18:00" },
                { days: "Wednesday", hours: "09:00 – 18:00" },
                { days: "Thursday", hours: "09:00 – 18:00" },
                { days: "Friday", hours: "09:00 – 17:00" },
                { days: "Saturday", hours: "10:00 – 14:00" },
                { days: "Sunday", hours: "Closed" },
              ],
              note:
                "On Saturdays an accountant is on duty during reporting periods only — please call before coming in. Enquiries sent by email are answered within one business day.",
            },
            {
              type: "contact",
              heading: "Contact",
              phone: PHONE,
              email: EMAIL,
              address: "Baku, Nasimi district, Jafar Jabbarly street, office centre, 4th floor",
            },
            {
              type: "cta",
              heading: "Want an outside look at your books?",
              subheading:
                "After a free 30-minute conversation you will know which documents are missing and what the next step is. No commitment.",
              ctaText: "Book a meeting",
              ctaUrl: "#elaqe",
            },
          ],
        },
      ],
      footer: {
        text: "© Qapan Konsalt LLC — Baku, Azerbaijan. This site is filled with demonstration content.",
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  RU
    // ════════════════════════════════════════════════════════════════════════
    ru: {
      design: "atlas",
      siteName: SITE_NAME,
      nav: [
        { label: "Услуги", href: "#xidmetler" },
        { label: "Стоимость", href: "#qiymetler" },
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
              heading: "Бухгалтерия, налоги и зарплата в одной команде",
              subheading:
                "Qapan Konsalt — бухгалтерская и налоговая консалтинговая практика в Баку. Мы ведём ежедневный учёт малых и средних компаний, сдаём отчётность в срок и по закрытии месяца объясняем цифры простым языком.",
              ctaText: "Бесплатная консультация",
              ctaUrl: "#elaqe",
            },
            {
              type: "features",
              heading: "Направления услуг",
              subheading:
                "Каждое направление можно заказать отдельно. Чаще всего компании начинают с ежемесячного учёта, а затем передают нам расчёт зарплаты и управленческую отчётность.",
              items: [
                {
                  title: "Ведение бухгалтерского учёта",
                  icon: "calculate",
                  text: "Учёт ежедневных операций: банковские выписки, касса, движение товаров и материалов, расчёты с дебиторами и кредиторами. Работаем в 1С или в той программе, которой вы уже пользуетесь; при закрытии месяца передаём оборотную ведомость и баланс.",
                },
                {
                  title: "Подготовка и сдача налоговой отчётности",
                  icon: "receipt_long",
                  text: "Налог на прибыль, упрощённый налог, НДС и отчётность по наёмному труду — подготовка и электронная сдача. Перед отправкой мы вместе с вами просматриваем цифры: цель в том, чтобы позже не пришлось сдавать уточнённый отчёт.",
                },
                {
                  title: "НДС и электронные накладные",
                  icon: "description",
                  text: "Выписка и приём электронных счётов-фактур, контроль зачёта НДС, сверка регистров покупок и продаж. Вовремя увидеть расхождение в накладной — часто самая ценная часть нашей работы.",
                },
                {
                  title: "Расчёт зарплаты и кадровые документы",
                  icon: "badge",
                  text: "Начисление заработной платы, удержания, учёт отпускных и больничных дней, регистрация трудовых договоров в электронной системе. Ежемесячные расчётные листки для сотрудников готовим тоже мы.",
                },
                {
                  title: "Регистрация компании и постановка учёта",
                  icon: "domain",
                  text: "Документы для регистрации новых ООО и индивидуальных предпринимателей, налаживание первичного документооборота, план счетов и письменная учётная политика. Компания, начинающая с нуля, к концу первого месяца точно знает, какой отчёт и кому она сдаёт.",
                },
                {
                  title: "Финансовая и управленческая отчётность",
                  icon: "insights",
                  text: "Ежемесячные отчёты для руководства: доходы и расходы, движение денежных средств, дебиторская задолженность. Это не налоговая отчётность: она нужна для решений, поэтому строится на языке вашего бизнеса и по вашим направлениям.",
                },
              ],
            },
            {
              type: "stats",
              items: [
                { value: "6", label: "направлений услуг" },
                { value: "3", label: "рабочих языка: азербайджанский, английский, русский" },
                { value: "1 рабочий день", label: "срок ответа на письменные запросы" },
                { value: "20", label: "месячная отчётность готова до 20-го числа" },
              ],
            },
            {
              type: "about",
              heading: "Небольшая команда, понятная ответственность",
              body:
                "Qapan Konsalt — небольшая практика, и мы намеренно остаёмся такими. За каждым клиентом закреплён ведущий бухгалтер: человек, который берёт трубку, — это тот же человек, который видит ваши документы. Именно эта связь обычно теряется в крупных фирмах.\n\nБольшая часть нашей работы — торговля, услуги, логистика и небольшое производство. Документооборот в этих сферах похож, поэтому уже с первого месяца мы обычно предполагаем, где возникнут сложности.\n\nОдно говорим сразу: приведение учёта в порядок часто начинается с неприятного разговора — не хватает документов за прошлые периоды, не выписаны накладные, сотрудники не оформлены. Мы это не прячем: составляем список и закрываем пункты вместе с вами, по порядку.",
            },
            {
              type: "process",
              heading: "Как строится работа",
              subheading:
                "Переход от первого звонка к обычному месячному режиму занимает одну-две недели. То, что ожидается на каждом шаге, подтверждается письменно.",
              items: [
                {
                  title: "Первый разговор",
                  text: "Бесплатная встреча на 30 минут — онлайн или в офисе. Обсуждаем вид деятельности, число сотрудников, налоговый режим и то, кто ведёт учёт сейчас. Документы на этом этапе не нужны.",
                },
                {
                  title: "Просмотр документов",
                  text: "Смотрим один-два последних отчётных периода: сданные отчёты, регистры накладных, трудовые договоры. В результате вы получаете список того, чего не хватает и что нужно исправить, — этот список остаётся у вас независимо от дальнейшего сотрудничества.",
                },
                {
                  title: "Предложение и договор",
                  text: "Объём работ, месячная стоимость, сроки передачи и распределение ответственности — на одной странице. До подписания работа не начинается, после подписания цена не меняется в течение согласованного периода.",
                },
                {
                  title: "Постановка учёта и приём дел",
                  text: "Настраиваем план счетов, вводим входящие остатки, договариваемся, в каком виде и к какому числу документы попадают к нам. Участвуем и в приёме дел у предыдущего бухгалтера.",
                },
                {
                  title: "Месячный режим",
                  text: "В течение месяца принимаем и проводим документы; к 20-му числу отчётность готова; перед отправкой проводим короткую встречу для подтверждения. По итогам квартала даём краткий отчёт с объяснением цифр.",
                },
              ],
            },
            {
              type: "team",
              heading: "С кем вы будете работать",
              subheading:
                "Работу ведут конкретные люди. Когда ведущий бухгалтер в отпуске, заменяющий назначается заранее, и ваши документы не ждут.",
              items: [
                {
                  name: "Нармин Алиева",
                  role: "Основатель, ведущий бухгалтер",
                  bio: "Ведёт направление бухгалтерского учёта и налоговой отчётности. Работает с компаниями из торговли и сферы услуг; учётная политика — её ответственность.",
                },
                {
                  name: "Рашад Гусейнов",
                  role: "Консультант по налогам",
                  bio: "Занимается выбором налогового режима, проверкой сданных отчётов и перепиской с налоговым органом. Сложное предпочитает объяснять коротко.",
                },
                {
                  name: "Айгюн Мамедова",
                  role: "Специалист по зарплате и кадровому учёту",
                  bio: "Начисление зарплаты, отпускные и больничные, регистрация трудовых договоров в электронной системе. Готовит ежемесячные расчётные листки.",
                },
                {
                  name: "Эльчин Касумов",
                  role: "Бухгалтер — НДС и накладные",
                  bio: "Ежедневная работа с электронными счётами-фактурами, зачётом НДС и сверкой регистров. Поддерживает текущий обмен документами с клиентами.",
                },
              ],
            },
            {
              type: "pricing",
              heading: "Стоимость услуг",
              subheading:
                "Основные направления публикуем открыто, чтобы вы заранее видели, что входит в цену. Итоговая сумма зависит от количества операций, числа сотрудников и налогового режима.",
              items: [
                {
                  name: "Первичная консультация",
                  price: "Бесплатно",
                  unit: "30 минут",
                  desc:
                    "Выслушиваем вашу ситуацию и объясняем, какие отчёты, кому и в какие сроки нужно сдавать. Никаких обязательств по дальнейшему сотрудничеству не возникает.",
                  features: [
                    "Онлайн или в офисе",
                    "На азербайджанском, английском или русском",
                    "Документы не требуются",
                  ],
                },
                {
                  name: "Ежемесячное бухгалтерское обслуживание",
                  price: "от 250 ₼",
                  unit: "в месяц",
                  desc:
                    "Полный набор для небольшой компании: ежедневный учёт, подготовка и сдача налоговой отчётности, закрытие месяца и квартальный отчёт с пояснениями. С ростом числа операций стоимость меняется ступенчато.",
                  featured: true,
                  features: [
                    "Ежедневный учёт и закрытие месяца",
                    "Сдача налоговой отчётности",
                    "Работа с электронными накладными",
                    "Ведущий бухгалтер и заменяющий",
                    "Отчётность готова до 20-го числа",
                    "Квартальный отчёт с пояснениями",
                  ],
                },
                {
                  name: "Расчёт заработной платы",
                  price: "от 8 ₼",
                  unit: "за сотрудника / в месяц",
                  desc:
                    "Начисления, удержания, отпускные и больничные, расчётные листки. Регистрация трудовых договоров в электронной системе входит в услугу.",
                  features: [
                    "Ежемесячные расчётные листки",
                    "Электронная регистрация договоров",
                    "Минимальный объём: 5 сотрудников",
                  ],
                },
                {
                  name: "Консультация по часам",
                  price: "60 ₼",
                  unit: "в час",
                  desc:
                    "Для одного конкретного вопроса: выбор налогового режима, проверка сданного отчёта, влияние условий договора на учёт. Время считается интервалами по 15 минут.",
                  features: ["Краткое письменное заключение", "Интервалы по 15 минут", "Договор на месяц не нужен"],
                },
                {
                  name: "Регистрация компании и постановка учёта",
                  price: "от 400 ₼",
                  unit: "разово",
                  desc:
                    "Подготовка документов на регистрацию, план счетов, письменная учётная политика и согласованный документооборот. Государственные пошлины в сумму не входят.",
                  features: [
                    "Подготовка документов",
                    "Учётная политика и план счетов",
                    "Первый месяц учёта включён",
                  ],
                },
              ],
              note:
                "Указанные суммы приведены для ориентира и не являются офертой. Точная стоимость рассчитывается по объёму документов, количеству операций и сотрудников, налоговому режиму и текущему состоянию отчётности и фиксируется в договоре. Восстановление прошлых периодов оценивается отдельно.",
            },
            {
              type: "logos",
              heading: "Примеры отраслей, с которыми мы работаем",
              items: PARTNERS,
            },
            {
              type: "testimonials",
              heading: "Что говорят клиенты",
              items: [
                {
                  quote:
                    "Больше всего ценю короткую встречу перед сдачей отчёта. Вижу цифру, задаю вопрос, и только потом отчёт уходит. Раньше я видел отчёт лишь после того, как его сдали.",
                  author: "Камран Сафаров",
                  role: "Директор, торговая компания",
                  rating: 5,
                },
                {
                  quote:
                    "Документы за два прошлых года были в беспорядке. Мне дали список, мы закрывали его по пунктам, и никто меня не обвинял. Это заняло три месяца, и я всегда знала, сколько осталось.",
                  author: "Лала Рагимова",
                  role: "Основатель, сфера услуг",
                  rating: 5,
                },
                {
                  quote:
                    "Когда сотрудников стало 40, расчёт зарплаты стал для нас тяжёлым. Мы передали это направление им. Расчётные листки приходят вовремя, вопросов от сотрудников стало меньше.",
                  author: "Турал Багиров",
                  role: "Операционный директор, логистика",
                  rating: 4,
                },
                {
                  quote:
                    "Они зарегистрировали компанию с нуля и поставили учёт за первый месяц. Мне выдали таблицу на одну страницу: какой документ и к какому числу отправить. Она до сих пор висит у меня на стене.",
                  author: "Гюнель Набиева",
                  role: "Владелец, небольшое производство",
                  rating: 5,
                },
              ],
            },
            {
              type: "faq",
              heading: "Частые вопросы",
              subheading:
                "Если ответа на ваш вопрос здесь нет — напишите, и мы ответим конкретно по телефону или по почте.",
              items: [
                {
                  question: "Как определяется цена?",
                  answer:
                    "Месячная стоимость складывается из четырёх факторов: количество документов и операций за месяц, число сотрудников, налоговый режим и текущее состояние отчётности. После первого разговора мы называем диапазон, а после просмотра документов указываем точную сумму в письменном предложении. Цифры в прайсе — отправная точка, а не окончательная цена.",
                },
                {
                  question: "Сколько времени это занимает?",
                  answer:
                    "Переход от первого разговора к обычному месячному режиму обычно занимает одну-две недели: 3–5 рабочих дней на просмотр документов и до недели на договор и постановку учёта. В текущем периоде отчётность готова до 20-го числа каждого месяца. Восстановление прошлых периодов длится дольше — от одного до трёх месяцев в зависимости от объёма, и срок мы называем до начала работы.",
                },
                {
                  question: "С кем именно я буду работать?",
                  answer:
                    "За вами закрепляется ведущий бухгалтер, и вся текущая переписка идёт через него. Сложные налоговые вопросы переходят к консультанту, зарплата ведётся отдельным специалистом. Если ведущий бухгалтер в отпуске или на больничном, заменяющий назначается заранее — заново объяснять свой бизнес не придётся.",
                },
                {
                  question: "Что будет, если объём работ окажется больше согласованного?",
                  answer:
                    "Объём зафиксирован в договоре через количество операций и сотрудников. Если фактические показатели два месяца подряд превышают согласованный предел, мы сообщаем об этом и предлагаем новую стоимость; до вашего согласия действуют прежние условия. Разовые всплески, например сезонный рост продаж, дополнительно не оплачиваются.",
                },
                {
                  question: "Работаете ли вы с небольшими компаниями и индивидуальными предпринимателями?",
                  answer:
                    "Да, именно небольшие компании и индивидуальные предприниматели составляют основу нашей работы. Мы строим рабочий режим и для ИП с одним сотрудником, и для компании с пятьюдесятью. Минимальный объём есть только в услуге расчёта зарплаты (5 сотрудников), в остальных его нет.",
                },
                {
                  question: "Какие условия договора и оплаты?",
                  answer:
                    "Заключается письменный договор; первоначальный срок — три месяца, далее он действует без ограничения срока. Оплата — банковским переводом в первые пять дней месяца, мы выдаём электронную накладную. Расторжение возможно с письменным уведомлением за месяц: в этом случае передача документов и базы учёта — наша обязанность и дополнительно не оплачивается.",
                },
              ],
            },
            {
              type: "hours",
              heading: "Часы работы",
              items: [
                { days: "Понедельник", hours: "09:00 – 18:00" },
                { days: "Вторник", hours: "09:00 – 18:00" },
                { days: "Среда", hours: "09:00 – 18:00" },
                { days: "Четверг", hours: "09:00 – 18:00" },
                { days: "Пятница", hours: "09:00 – 17:00" },
                { days: "Суббота", hours: "10:00 – 14:00" },
                { days: "Воскресенье", hours: "Закрыто" },
              ],
              note:
                "По субботам дежурный бухгалтер работает только в отчётные периоды — позвоните перед визитом. На запросы по электронной почте отвечаем в течение одного рабочего дня.",
            },
            {
              type: "contact",
              heading: "Контакты",
              phone: PHONE,
              email: EMAIL,
              address: "Баку, Насиминский район, улица Джафара Джаббарлы, офисный центр, 4-й этаж",
            },
            {
              type: "cta",
              heading: "Нужен взгляд со стороны на ваш учёт?",
              subheading:
                "После бесплатного разговора на 30 минут вы будете знать, каких документов не хватает и каким будет следующий шаг. Без обязательств.",
              ctaText: "Назначить встречу",
              ctaUrl: "#elaqe",
            },
          ],
        },
      ],
      footer: {
        text: "© Qapan Konsalt MMC — Баку, Азербайджан. Сайт заполнен демонстрационным содержимым.",
      },
    },
  },
};
