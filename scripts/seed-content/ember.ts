/**
 * Demo məzmun — "ember" dizaynı (restoran / kafe / bar).
 *
 * Biznes UYDURMADIR: "Yeddi Ocaq" adlı restoran mövcud deyil. Telefon nömrəsi,
 * ünvan və e-poçt qəsdən placeholder formatındadır (+994 12 000 00 00,
 * "Xaqani küçəsi 00"), ki heç bir real biznesin məlumatı ilə üst-üstə düşməsin.
 *
 * Qaydalar:
 *  - Heç bir mükafat, reytinq, "ən yaxşı", "1952-ci ildən" tipli iddia yoxdur.
 *  - Rəylər açıq-aydın nümunə xarakterlidir: yalnız ad, ulduz reytinqi yoxdur.
 *  - `imageUrl` sahələri boşdur — fotoqrafiya ayrı mərhələdə doldurulur.
 *    (Qalereyada `imageUrl` tip tələbi olduğu üçün boş sətir verilir; dizayn
 *    boş şəkilləri süzür, ona görə səhifə dağılmır.)
 *  - Menyu bu şablonun mərkəzidir: 4 qrup, 22 yemək, Bakı üçün real qiymətlər.
 */
import type { LocalizedBundle, SiteTheme } from "../../src/lib/site-content";

// ── Tema ───────────────────────────────────────────────────────────────────
// Ember zəmini `primary`-ni tünd mürəkkəbə qarışdırır və "ocaq işığı" kimi
// istifadə edir, ona görə orta tonlu isti kərpic-narıncı ən yaxşı işləyir:
// kifayət qədər doymuş ki, işıq görünsün; kifayət qədər tünd ki, krem menyu
// kartının üzərində kontrast itməsin.
export const emberTheme: SiteTheme = {
  colors: {
    primary: "#c2622c",
    bg: "#15100c",
    surface: "#1f1815",
    text: "#f4ece0",
    muted: "#c3b3a1",
  },
  fonts: {
    heading: "'Newsreader', Georgia, 'Times New Roman', serif",
    body: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
};

export const emberContent: LocalizedBundle = {
  defaultLocale: "az",
  locales: {
    // ══════════════════════════════════════════════════════════════════════
    //  AZ
    // ══════════════════════════════════════════════════════════════════════
    az: {
      design: "ember",
      siteName: "Yeddi Ocaq",
      nav: [
        { label: "Haqqımızda", href: "#haqqimizda" },
        { label: "Menyu", href: "#menyu" },
        { label: "Qalereya", href: "#qalereya" },
        { label: "İş saatları", href: "#is-saatlari" },
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
              heading: "Odun ocağında bişən Azərbaycan mətbəxi",
              subheading:
                "Yeddi Ocaq — on beş masası və açıq odun ocağı olan kiçik yemək zalıdır. Menyumuz qısadır, çünki hər yeməyi həmin gün alınmış ətdən və tərəvəzdən hazırlayırıq.",
              ctaText: "Masa rezerv edin",
              ctaUrl: "#elaqe",
            },
            {
              type: "about",
              heading: "Bir ocaq, bir süfrə",
              body:
                "Zalın ortasında odun ocağı var və mətbəxi divar arxasında gizlətmirik. Oturduğunuz yerdən kababın ocağa düzülməsinə, təndirdən çörəyin çıxarılmasına baxa bilərsiniz. Bu, dekorasiya deyil — yemək belə bişir və biz onu göstərməkdən çəkinmirik.\n\nMenyunu mövsümə görə yazırıq. Pomidorun dadı olmayan aylarda pomidor salatı təklif etmirik, badımcan mövsümündə isə badımcan üç ayrı yeməkdə olur. Porsiyalar bölüşmək üçün nəzərdə tutulub: masaya bir neçə boşqab qoyub ortadan yemək bizdə adi haldır. Tələsmirik, sizi də tələsdirmirik — axşam yeməyi bir saatdan qısa olmasın.",
            },
            {
              type: "menu",
              heading: "Menyu",
              groups: [
                {
                  name: "Başlanğıclar",
                  items: [
                    {
                      name: "Kükü",
                      desc: "Göyərti kükülü — şüyüd, keşniş və yaşıl soğanla, qatıqla verilir.",
                      price: "11 ₼",
                    },
                    {
                      name: "Qutab (3 ədəd)",
                      desc: "Göyərti, balqabaq və ya dana ətindən. Sacda bişirilir, üstünə ərinmiş kərə yağı çəkilir.",
                      price: "9 ₼",
                    },
                    {
                      name: "Badımcan əzməsi",
                      desc: "Ocaqda tüstülənən badımcan, pomidor, bibər və sarımsaq. Təndir çörəyi ilə.",
                      price: "10 ₼",
                    },
                    {
                      name: "Çoban salatı",
                      desc: "Xırda doğranmış pomidor, xiyar, soğan və göyərti; nar turşusu və zeytun yağı ilə.",
                      price: "9 ₼",
                    },
                    {
                      name: "Pendir və zeytun boşqabı",
                      desc: "Motal, şor və çəmi pendiri, zeytun, qoz və bal.",
                      price: "16 ₼",
                    },
                    {
                      name: "Yarpaq dolması",
                      desc: "Üzüm yarpağında dana və quzu ətindən dolma, sarımsaqlı qatıqla.",
                      price: "15 ₼",
                    },
                  ],
                },
                {
                  name: "Əsas yeməklər",
                  items: [
                    {
                      name: "Piti (küpədə)",
                      desc: "Quzu, noxud və quyruq yağı gil küpədə saatlarla dəmlənir. Sumaq və soğanla verilir.",
                      price: "17 ₼",
                    },
                    {
                      name: "Quzu buğlaması",
                      desc: "Quzu ətinin öz suyunda ağır qapaq altında bişməsi. Kartof və pomidorla.",
                      price: "32 ₼",
                    },
                    {
                      name: "Şirin plov",
                      desc: "Zəfəranlı düyü, quzu, kişmiş, ərik qurusu və şabalıd; ayrı qazmaq ilə.",
                      price: "26 ₼",
                    },
                    {
                      name: "Sacda quzu",
                      desc: "Quzu ətinin badımcan, bibər və pomidorla sacda qovurulması. İki nəfərə bəs edir.",
                      price: "34 ₼",
                    },
                    {
                      name: "Dovğa",
                      desc: "İsti verilən qatıq şorbası — göyərti, düyü və noxudla. Ətli və ətsiz variantı var.",
                      price: "8 ₼",
                    },
                    {
                      name: "Fırında levrek",
                      desc: "Bütöv balıq, limon və göyərti ilə; yanında ocaqda bişmiş tərəvəz.",
                      price: "30 ₼",
                    },
                  ],
                },
                {
                  name: "Kabablar",
                  items: [
                    {
                      name: "Quzu tikə kababı",
                      desc: "Bel ətindən, yalnız duz və soğan suyunda saxlanılır. Soğan və sumaqla.",
                      price: "22 ₼",
                    },
                    {
                      name: "Lülə kabab",
                      desc: "Əldə çəkilmiş dana ətindən, təndir çörəyinin içində verilir.",
                      price: "14 ₼",
                    },
                    {
                      name: "Toyuq kababı",
                      desc: "Döş və qanad qarışığı, zəfəran və qatıqda saxlanılıb.",
                      price: "13 ₼",
                    },
                    {
                      name: "Quzu qabırğası",
                      desc: "Ocağın kənarında yavaş bişirilir, ortası şirəli qalır. Nar dənəsi ilə.",
                      price: "27 ₼",
                    },
                    {
                      name: "Balıq kababı",
                      desc: "Mövsümi ağ balıq, dəfnə yarpağı və limonla şişə düzülür.",
                      price: "24 ₼",
                    },
                    {
                      name: "Tərəvəz kababı",
                      desc: "Badımcan, bibər, pomidor və göbələk; ocaq tüstüsü ilə. Ət yeməyənlər üçün.",
                      price: "10 ₼",
                    },
                  ],
                },
                {
                  name: "Şirniyyat və çay",
                  items: [
                    {
                      name: "Bakı paxlavası",
                      desc: "Qoz, zəfəran və bal şərbəti ilə; iki dilim.",
                      price: "7 ₼",
                    },
                    {
                      name: "Şəkərbura",
                      desc: "Fındıq və hil ilə doldurulur, səhər yoğrulan xəmirdən.",
                      price: "5 ₼",
                    },
                    {
                      name: "Firni",
                      desc: "Düyü unu, süd və zəfəran; üstünə darçın səpilir. İsti verilir.",
                      price: "8 ₼",
                    },
                    {
                      name: "Şəki halvası",
                      desc: "Rişdə xəmiri, fındıq və şəkər şərbəti. Bir tikə kifayət edir.",
                      price: "9 ₼",
                    },
                    {
                      name: "Çay dəsti",
                      desc: "Armudu stəkanda dəmlənmiş çay, ev mürəbbəsi, limon və qurudan qoz-fındıq.",
                      price: "7 ₼",
                    },
                  ],
                },
              ],
            },
            {
              type: "features",
              heading: "Süfrəmizin qaydaları",
              subheading:
                "Bir neçə şeyi əvvəldən deyirik ki, gəlməmişdən nə gözlədiyinizi biləsiniz.",
              items: [
                {
                  title: "Açıq odun ocağı",
                  text: "Kabablar və sacda yeməklər zalın ortasındakı ocaqda bişir. Qaz və elektrik qrili işlətmirik — ona görə kabab bir az gözlədir.",
                },
                {
                  title: "Səhər yoğrulan xəmir",
                  text: "Təndir çörəyi, qutab və şirniyyat xəmiri hər gün səhər hazırlanır və gün ərzində porsiya-porsiya bişirilir.",
                },
                {
                  title: "Mövsümi tərəvəz",
                  text: "Göyərti və tərəvəz Bakı bazarlarından günü-gününə alınır. Mövsümdə olmayan məhsulu menyuya yazmırıq.",
                },
                {
                  title: "Eyvan və qapalı zal",
                  text: "Aprel–oktyabr aylarında eyvanda 20 yer açılır. Qapalı zal ilin hər fəslində, hava şəraitindən asılı olmadan işləyir.",
                },
                {
                  title: "Cümə və şənbə canlı musiqi",
                  text: "Tar və kaman ifa olunur, səs səviyyəsi masadakı söhbətə mane olmayacaq şəkildə saxlanılır.",
                },
                {
                  title: "Qrup və qeyd günləri",
                  text: "30 nəfərə qədər ayrı zal ayırırıq. Menyunu əvvəlcədən birlikdə seçirik ki, yemək masaya isti və birlikdə gəlsin.",
                },
              ],
            },
            {
              type: "gallery",
              heading: "Zal və mətbəx",
              items: [
                { imageUrl: "", caption: "Zalın ortasındakı odun ocağı" },
                { imageUrl: "", caption: "Təndirdən çıxan çörək" },
                { imageUrl: "", caption: "Şişə düzülmüş quzu tikəsi" },
                { imageUrl: "", caption: "Eyvandaki masalar, yay axşamı" },
                { imageUrl: "", caption: "Küpədə piti — masaya gələn an" },
                { imageUrl: "", caption: "Çay dəsti və ev mürəbbələri" },
              ],
            },
            {
              type: "pricing",
              heading: "Set menyular",
              subheading:
                "Böyük masalar üçün əvvəlcədən seçilmiş dəstlər. Belə olanda mətbəx hər şeyi bir vaxtda hazırlayır və gözləmə vaxtı yarıya düşür.",
              items: [
                {
                  name: "Nahar dəsti",
                  price: "24 ₼",
                  unit: "nəfər başına",
                  desc: "Yalnız həftə içi, 12:00–16:00 arası verilir.",
                  features: [
                    "Gün şorbası: piti və ya dovğa",
                    "Bir başlanğıc: kükü, çoban salatı və ya badımcan əzməsi",
                    "Əsas yemək: lülə kabab, toyuq kababı və ya dolma",
                    "Təndir çörəyi və göyərti",
                    "Çay",
                  ],
                },
                {
                  name: "Ocaq dəsti",
                  price: "45 ₼",
                  unit: "nəfər başına",
                  desc: "Masanın ortasına düzülən, bölüşmək üçün nəzərdə tutulmuş dəst. Ən azı iki nəfərdən sifariş olunur.",
                  featured: true,
                  features: [
                    "Dörd başlanğıc: kükü, badımcan əzməsi, çoban salatı, pendir boşqabı",
                    "Kabab qarışığı: quzu tikəsi, lülə, toyuq",
                    "Sacda tərəvəz",
                    "Təndir çörəyi və göyərti",
                    "Şirniyyat: paxlava və şəkərbura",
                    "Çay, limon və ev mürəbbəsi ilə",
                  ],
                },
                {
                  name: "Bayram süfrəsi",
                  price: "68 ₼",
                  unit: "nəfər başına",
                  desc: "Ad günü, nişan və ailə yığıncaqları üçün. Ən azı altı nəfər, bir gün əvvəldən sifariş.",
                  features: [
                    "Altı başlanğıc və iki isti qəlyanaltı",
                    "Şirin plov, quzu buğlaması, kabab qarışığı",
                    "Fırında balıq (istəyə görə)",
                    "Mövsümi meyvə boşqabı",
                    "Şirniyyat: paxlava, şəkərbura, Şəki halvası",
                    "Çay xidməti axşamın sonuna qədər",
                    "Ayrı zal və masa düzümü",
                  ],
                },
                {
                  name: "Uşaq dəsti",
                  price: "14 ₼",
                  unit: "bir uşaq üçün",
                  desc: "Kiçik porsiya, kəskin ədviyyat və tüstülü dad olmadan.",
                  features: [
                    "Toyuq kababı və ya lülə kabab (kiçik porsiya)",
                    "Kartof püresi və ya sadə düyü",
                    "Xiyar-pomidor dilimləri",
                    "Ev kompotu",
                  ],
                },
              ],
              note: "Qiymətlər bir nəfər üçündür. Hesaba 10% xidmət haqqı əlavə olunur. Set menyunu ən azı bir gün əvvəldən təsdiqləməyinizi xahiş edirik.",
            },
            {
              type: "team",
              heading: "Mətbəx və zal",
              subheading: "Zalda kimin nə işlə məşğul olduğunu bilmək yaxşıdır.",
              items: [
                {
                  name: "Elçin Muradlı",
                  role: "Baş aşpaz",
                  bio: "Menyunu mövsümə görə yazır, ət və balığı özü seçir. Buğlama və plov onun əlindən çıxır.",
                },
                {
                  name: "Nərmin Səfərova",
                  role: "İkinci aşpaz",
                  bio: "Xəmir işləri onun üzərindədir: təndir çörəyi, qutab, paxlava və şəkərbura.",
                },
                {
                  name: "Rüfət Alıyev",
                  role: "Ocaqbaşı",
                  bio: "Kababı bişirən adam. Ətin duzunu, şişin dönmə vaxtını və kömürün gücünü o tənzimləyir.",
                },
                {
                  name: "Aysel Qədirova",
                  role: "Zal rəhbəri",
                  bio: "Rezervasiyaları qeyd edir, qrup yeməklərini planlayır və qapıda sizi o qarşılayır.",
                },
              ],
            },
            {
              type: "testimonials",
              heading: "Qonaqların dedikləri",
              subheading:
                "Aşağıdakı rəylər şablon üçün yazılmış nümunələrdir — real qonaq sözləri deyil.",
              items: [
                {
                  quote:
                    "Ocağın yanındakı masada oturduq və kabab gələnə qədər onun bişməsinə baxdıq. Uzun müddətdir belə sadə, düz bişirilmiş yemək yeməmişdim.",
                  author: "Kamran",
                  role: "Axşam yeməyi, iki nəfər",
                },
                {
                  quote:
                    "Ailə ilə bazar günü nahara getdik. Uşaq üçün ayrıca dəst var idi, ofisiant bizi tələsdirmədi, hesab da gözlədiyimdən artıq olmadı.",
                  author: "Lalə",
                  role: "Bazar günü naharı",
                },
                {
                  quote:
                    "İş yoldaşları ilə səkkiz nəfər gəldik. Menyunu əvvəlcədən seçdiyimiz üçün hər şey isti və birlikdə masaya gəldi.",
                  author: "Tural",
                  role: "İş yeməyi",
                },
                {
                  quote:
                    "Vegetarianam, restoranda adətən iki variantla kifayətlənirəm. Burada kükü, tərəvəz kababı və göyərti qutabı ilə tam bir süfrə oldu.",
                  author: "Səbinə",
                  role: "Qonaq",
                },
              ],
            },
            {
              type: "faq",
              heading: "Tez-tez verilən suallar",
              items: [
                {
                  question: "Masanı əvvəlcədən rezerv etmək lazımdır?",
                  answer:
                    "Həftə içi saat 19:00-a qədər adətən boş masa olur. Cümə və şənbə axşamları, həmçinin bazar günü naharı üçün bir gün əvvəldən zəng etməyinizi xahiş edirik. Rezervasiyanı telefonla və ya WhatsApp mesajı ilə təsdiqləyirik.",
                },
                {
                  question: "Qrup üçün ayrı yer ayırırsınız?",
                  answer:
                    "Bəli. 10 nəfərdən yuxarı qruplar üçün zalın ayrı hissəsini, 30 nəfərə qədər isə qapalı zalı ayırırıq. Bu halda menyunu əvvəlcədən birlikdə seçirik — set menyular bölməsində variantlar var.",
                },
                {
                  question: "Avtomobil saxlamaq üçün yer var?",
                  answer:
                    "Binanın qarşısındakı küçədə park yeri var, amma axşam saatlarında tez tutulur. Ən yaxın ödənişli dayanacaq beş dəqiqəlik piyada məsafədədir; rezervasiya edərkən desəniz, yol göstərişini mesajla göndərək.",
                },
                {
                  question: "Uşaqlarla gəlmək olar?",
                  answer:
                    "Əlbəttə. Uşaq stullarımız var, menyuda uşaq dəsti göstərilib, açıq ocaq isə zalın keçid yollarından uzaq tərəfindədir. Uşaq arabası ilə giriş birinci mərtəbədən, pilləkənsizdir.",
                },
                {
                  question: "Vegetarian və ya digər pəhriz variantları var?",
                  answer:
                    "Kükü, badımcan əzməsi, çoban salatı, göyərti qutabı, tərəvəz kababı və ətsiz dovğa ət olmadan hazırlanır. Qlüten, süd və ya qoz-fındıqla bağlı məhdudiyyətiniz varsa, sifarişdən əvvəl deyin — aşpaz hansı yeməyin uyğun olduğunu birbaşa söyləyəcək.",
                },
                {
                  question: "Canlı musiqi hansı günlərdir?",
                  answer:
                    "Cümə və şənbə axşamları saat 20:00-dan 23:00-a qədər tar və kaman ifa olunur. Digər günlərdə zalda yalnız sakit fon musiqisi olur, söhbət üçün rahatdır.",
                },
                {
                  question: "Kartla ödəniş qəbul edirsiniz?",
                  answer:
                    "Bəli — nağd, Visa və Mastercard, həmçinin telefonla təmassız ödəniş işləyir. Hesabı masada bölmək istəsəniz, ofisiantla əvvəlcədən deyin, ayrı-ayrı hazırlayaq.",
                },
              ],
            },
            {
              type: "hours",
              heading: "İş saatları",
              items: [
                { days: "Bazar ertəsi", hours: "12:00 – 23:00" },
                { days: "Çərşənbə axşamı", hours: "12:00 – 23:00" },
                { days: "Çərşənbə", hours: "12:00 – 23:00" },
                { days: "Cümə axşamı", hours: "12:00 – 23:00" },
                { days: "Cümə", hours: "12:00 – 00:30" },
                { days: "Şənbə", hours: "11:00 – 00:30" },
                { days: "Bazar", hours: "11:00 – 22:00" },
              ],
              note: "Mətbəx bağlanışdan bir saat əvvəl son sifarişi qəbul edir. Novruz və Qurban bayramı günlərində saatlar dəyişir — həmin həftə telefonla dəqiqləşdirin.",
            },
            {
              type: "contact",
              heading: "Bizi tapın",
              phone: "+994 12 000 00 00",
              email: "rezervasiya@yeddiocaq.example",
              address: "Xaqani küçəsi 00, Səbail rayonu, Bakı",
            },
            {
              type: "cta",
              heading: "Masanızı ayıraq",
              subheading:
                "Neçə nəfər olduğunuzu və saatı deyin — qalanını biz düzəldək. Eyvan istəyirsinizsə, bunu da qeyd edin.",
              ctaText: "Rezervasiya edin",
              ctaUrl: "#elaqe",
            },
          ],
        },
      ],
      footer: {
        text: "Yeddi Ocaq · Bakı, Səbail. Bu sayt nümunə məzmunla doldurulub.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp", href: "#" },
        ],
      },
    },

    // ══════════════════════════════════════════════════════════════════════
    //  EN
    // ══════════════════════════════════════════════════════════════════════
    en: {
      design: "ember",
      siteName: "Yeddi Ocaq",
      nav: [
        { label: "About", href: "#haqqimizda" },
        { label: "Menu", href: "#menyu" },
        { label: "Gallery", href: "#qalereya" },
        { label: "Hours", href: "#is-saatlari" },
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
              heading: "Azerbaijani cooking over a wood fire",
              subheading:
                "Yeddi Ocaq is a small dining room with fifteen tables and an open wood hearth in the middle of it. The menu is short because everything is made from meat and vegetables bought that same morning.",
              ctaText: "Book a table",
              ctaUrl: "#elaqe",
            },
            {
              type: "about",
              heading: "One hearth, one table",
              body:
                "The fire sits in the middle of the room and the kitchen is not hidden behind a wall. From your table you can watch skewers going over the coals and bread coming out of the tandir oven. That is not decoration — it is simply how the food is cooked, and we would rather you saw it.\n\nThe menu follows the season. We do not serve tomato salad in the months when tomatoes have no taste, and in aubergine season aubergine turns up in three different dishes. Portions are built for sharing: putting several plates in the middle of the table and eating from all of them is the normal way here. We are not in a hurry, and we will not hurry you — dinner should take longer than an hour.",
            },
            {
              type: "menu",
              heading: "Menu",
              groups: [
                {
                  name: "Starters",
                  items: [
                    {
                      name: "Kükü",
                      desc: "Herb frittata with dill, coriander and spring onion, served with cold yoghurt.",
                      price: "11 ₼",
                    },
                    {
                      name: "Qutab (3 pieces)",
                      desc: "Thin flatbread folded over herbs, pumpkin or minced beef, cooked on a sac griddle and brushed with butter.",
                      price: "9 ₼",
                    },
                    {
                      name: "Smoked aubergine dip",
                      desc: "Aubergine charred over the coals with tomato, pepper and garlic. Comes with tandir bread.",
                      price: "10 ₼",
                    },
                    {
                      name: "Shepherd's salad",
                      desc: "Finely chopped tomato, cucumber, onion and herbs with pomegranate molasses and olive oil.",
                      price: "9 ₼",
                    },
                    {
                      name: "Cheese and olive plate",
                      desc: "Motal, shor and çəmi cheeses with olives, walnuts and honey.",
                      price: "16 ₼",
                    },
                    {
                      name: "Vine leaf dolma",
                      desc: "Vine leaves rolled around beef and lamb, served with garlic yoghurt.",
                      price: "15 ₼",
                    },
                  ],
                },
                {
                  name: "Main courses",
                  items: [
                    {
                      name: "Piti in a clay pot",
                      desc: "Lamb, chickpeas and tail fat cooked slowly in a sealed clay pot. Served with sumac and raw onion.",
                      price: "17 ₼",
                    },
                    {
                      name: "Lamb buğlama",
                      desc: "Lamb steamed in its own juices under a heavy lid, with potato and tomato.",
                      price: "32 ₼",
                    },
                    {
                      name: "Sweet plov",
                      desc: "Saffron rice with lamb, raisins, dried apricot and chestnut, with the crisp qazmaq crust served on the side.",
                      price: "26 ₼",
                    },
                    {
                      name: "Lamb sac",
                      desc: "Lamb fried on an iron sac with aubergine, pepper and tomato. Enough for two.",
                      price: "34 ₼",
                    },
                    {
                      name: "Dovğa",
                      desc: "Warm yoghurt soup with herbs, rice and chickpeas. Available with or without meatballs.",
                      price: "8 ₼",
                    },
                    {
                      name: "Whole roast sea bass",
                      desc: "Baked whole with lemon and herbs, with vegetables cooked over the fire alongside.",
                      price: "30 ₼",
                    },
                  ],
                },
                {
                  name: "From the coals",
                  items: [
                    {
                      name: "Lamb tikə kebab",
                      desc: "Cubes of loin, kept in nothing but salt and onion juice. Served with onion and sumac.",
                      price: "22 ₼",
                    },
                    {
                      name: "Lülə kebab",
                      desc: "Hand-minced beef pressed onto the skewer, served wrapped in tandir bread.",
                      price: "14 ₼",
                    },
                    {
                      name: "Chicken kebab",
                      desc: "Breast and wing together, marinated in saffron and yoghurt.",
                      price: "13 ₼",
                    },
                    {
                      name: "Lamb ribs",
                      desc: "Cooked slowly at the edge of the fire so the centre stays juicy. Finished with pomegranate seeds.",
                      price: "27 ₼",
                    },
                    {
                      name: "Fish kebab",
                      desc: "Seasonal white fish skewered with bay leaf and lemon.",
                      price: "24 ₼",
                    },
                    {
                      name: "Vegetable kebab",
                      desc: "Aubergine, pepper, tomato and mushroom, smoky from the coals. Cooked without meat.",
                      price: "10 ₼",
                    },
                  ],
                },
                {
                  name: "Sweets and tea",
                  items: [
                    {
                      name: "Baku paxlava",
                      desc: "Walnut, saffron and honey syrup. Two diamonds to a plate.",
                      price: "7 ₼",
                    },
                    {
                      name: "Şəkərbura",
                      desc: "Pastry crescent filled with hazelnut and cardamom, from dough made that morning.",
                      price: "5 ₼",
                    },
                    {
                      name: "Firni",
                      desc: "Rice flour, milk and saffron, dusted with cinnamon. Served warm.",
                      price: "8 ₼",
                    },
                    {
                      name: "Sheki halva",
                      desc: "Layers of fine rice-flour threads with hazelnut and sugar syrup. One piece is plenty.",
                      price: "9 ₼",
                    },
                    {
                      name: "Tea service",
                      desc: "Tea brewed and poured into armudu glasses, with homemade preserves, lemon and dried nuts.",
                      price: "7 ₼",
                    },
                  ],
                },
              ],
            },
            {
              type: "features",
              heading: "How we do things",
              subheading:
                "A few things worth knowing before you come, so nothing about the evening is a surprise.",
              items: [
                {
                  title: "An open wood fire",
                  text: "Kebabs and sac dishes are cooked over the hearth in the middle of the room. We do not use gas or electric grills, which is why a kebab takes a little longer to arrive.",
                },
                {
                  title: "Dough made each morning",
                  text: "Tandir bread, qutab and pastry dough are mixed early and baked in small batches through the day rather than all at once.",
                },
                {
                  title: "Vegetables in season",
                  text: "Herbs and vegetables are bought from Baku markets the same day. If something is out of season, it is off the menu until it is back.",
                },
                {
                  title: "Terrace and indoor room",
                  text: "From April to October the terrace adds around 20 seats. The indoor room runs all year, whatever the weather is doing.",
                },
                {
                  title: "Live music on Friday and Saturday",
                  text: "Tar and kamancha are played in the evening, kept at a volume you can still talk over.",
                },
                {
                  title: "Groups and celebrations",
                  text: "We set aside a private room for up to 30 guests. We agree the menu in advance so the food reaches the table hot and all together.",
                },
              ],
            },
            {
              type: "gallery",
              heading: "The room and the kitchen",
              items: [
                { imageUrl: "", caption: "The wood hearth in the middle of the room" },
                { imageUrl: "", caption: "Bread coming out of the tandir" },
                { imageUrl: "", caption: "Lamb going onto the skewer" },
                { imageUrl: "", caption: "Terrace tables on a summer evening" },
                { imageUrl: "", caption: "Piti arriving at the table in its clay pot" },
                { imageUrl: "", caption: "Tea service with homemade preserves" },
              ],
            },
            {
              type: "pricing",
              heading: "Set menus",
              subheading:
                "Menus chosen in advance for larger tables. It lets the kitchen cook everything on one timeline and cuts the waiting in half.",
              items: [
                {
                  name: "Lunch set",
                  price: "24 ₼",
                  unit: "per person",
                  desc: "Weekdays only, served between 12:00 and 16:00.",
                  features: [
                    "Soup of the day: piti or dovğa",
                    "One starter: kükü, shepherd's salad or aubergine dip",
                    "Main: lülə kebab, chicken kebab or dolma",
                    "Tandir bread and fresh herbs",
                    "Tea",
                  ],
                },
                {
                  name: "Hearth set",
                  price: "45 ₼",
                  unit: "per person",
                  desc: "Laid out down the middle of the table and meant to be shared. Ordered for two guests or more.",
                  featured: true,
                  features: [
                    "Four starters: kükü, aubergine dip, shepherd's salad, cheese plate",
                    "Mixed kebabs: lamb tikə, lülə, chicken",
                    "Vegetables from the sac",
                    "Tandir bread and fresh herbs",
                    "Sweets: paxlava and şəkərbura",
                    "Tea with lemon and homemade preserves",
                  ],
                },
                {
                  name: "Celebration table",
                  price: "68 ₼",
                  unit: "per person",
                  desc: "For birthdays, engagements and family gatherings. Six guests minimum, confirmed a day ahead.",
                  features: [
                    "Six starters and two hot appetisers",
                    "Sweet plov, lamb buğlama and mixed kebabs",
                    "Whole roast fish, if you want it",
                    "Seasonal fruit plate",
                    "Sweets: paxlava, şəkərbura, Sheki halva",
                    "Tea service until the end of the evening",
                    "Private room and table layout",
                  ],
                },
                {
                  name: "Children's set",
                  price: "14 ₼",
                  unit: "per child",
                  desc: "Smaller portions, cooked without sharp spice or heavy smoke.",
                  features: [
                    "Small chicken or lülə kebab",
                    "Mashed potato or plain rice",
                    "Sliced cucumber and tomato",
                    "Homemade fruit kompot",
                  ],
                },
              ],
              note: "Prices are per person. A 10% service charge is added to the bill. Please confirm a set menu at least one day in advance.",
            },
            {
              type: "team",
              heading: "Kitchen and floor",
              subheading: "It helps to know who is doing what in the room.",
              items: [
                {
                  name: "Elchin Muradli",
                  role: "Head chef",
                  bio: "Writes the menu around the season and picks the meat and fish himself. Buğlama and plov come from his station.",
                },
                {
                  name: "Narmin Safarova",
                  role: "Second chef",
                  bio: "Everything made of dough is hers: tandir bread, qutab, paxlava and şəkərbura.",
                },
                {
                  name: "Rufat Aliyev",
                  role: "Fire cook",
                  bio: "The one on the coals. He decides the salt, when the skewer turns and how hard the fire runs.",
                },
                {
                  name: "Aysel Gadirova",
                  role: "Floor manager",
                  bio: "Takes the bookings, plans the group menus and is the person who meets you at the door.",
                },
              ],
            },
            {
              type: "testimonials",
              heading: "What guests say",
              subheading:
                "The notes below are written samples for this template, not real guest reviews.",
              items: [
                {
                  quote:
                    "We sat at the table next to the fire and watched our kebab cook until it arrived. It had been a long time since I ate something this plain and this well cooked.",
                  author: "Kamran",
                  role: "Dinner for two",
                },
                {
                  quote:
                    "Came with the family on a Sunday. There was a proper set for our daughter, nobody rushed us, and the bill was no bigger than I expected.",
                  author: "Lala",
                  role: "Sunday lunch",
                },
                {
                  quote:
                    "Eight of us from work. Because we had picked the menu in advance, everything reached the table hot and at the same time.",
                  author: "Tural",
                  role: "Work dinner",
                },
                {
                  quote:
                    "I am vegetarian and usually make do with two options. Here the kükü, vegetable kebab and herb qutab added up to a full table.",
                  author: "Sabina",
                  role: "Guest",
                },
              ],
            },
            {
              type: "faq",
              heading: "Frequently asked questions",
              items: [
                {
                  question: "Do I need to book a table?",
                  answer:
                    "On weekdays before 19:00 there is usually a free table. For Friday and Saturday evenings, and for Sunday lunch, please call a day ahead. We confirm every booking by phone or WhatsApp message.",
                },
                {
                  question: "Can you take a group?",
                  answer:
                    "Yes. For groups over 10 we set aside a separate part of the room, and up to 30 guests can have the private room. In that case we agree the menu beforehand — the options are in the set menus section.",
                },
                {
                  question: "Is there parking?",
                  answer:
                    "There is street parking on the road in front of the building, though it fills up quickly in the evening. The nearest paid car park is a five-minute walk away; mention it when you book and we will send directions by message.",
                },
                {
                  question: "Are children welcome?",
                  answer:
                    "Of course. We have high chairs, there is a children's set on the menu, and the open fire is on the far side of the room from the walkways. Step-free entry for prams is on the ground floor.",
                },
                {
                  question: "What about vegetarian or other dietary needs?",
                  answer:
                    "Kükü, aubergine dip, shepherd's salad, herb qutab, vegetable kebab and meat-free dovğa are all cooked without meat. If you avoid gluten, dairy or nuts, tell us before you order and the chef will say plainly which dishes work.",
                },
                {
                  question: "Which nights have live music?",
                  answer:
                    "Friday and Saturday, from 20:00 to 23:00, with tar and kamancha. On other nights there is only quiet background music, so the room stays easy to talk in.",
                },
                {
                  question: "Do you take cards?",
                  answer:
                    "Yes — cash, Visa and Mastercard, and contactless payment by phone. If you want the bill split at the table, tell your waiter in advance and we will prepare it separately.",
                },
              ],
            },
            {
              type: "hours",
              heading: "Opening hours",
              items: [
                { days: "Monday", hours: "12:00 – 23:00" },
                { days: "Tuesday", hours: "12:00 – 23:00" },
                { days: "Wednesday", hours: "12:00 – 23:00" },
                { days: "Thursday", hours: "12:00 – 23:00" },
                { days: "Friday", hours: "12:00 – 00:30" },
                { days: "Saturday", hours: "11:00 – 00:30" },
                { days: "Sunday", hours: "11:00 – 22:00" },
              ],
              note: "The kitchen takes its last order one hour before closing. Hours change over Novruz and Gurban Bayram — please call that week to check.",
            },
            {
              type: "contact",
              heading: "Find us",
              phone: "+994 12 000 00 00",
              email: "rezervasiya@yeddiocaq.example",
              address: "Xaqani street 00, Sabail district, Baku",
            },
            {
              type: "cta",
              heading: "Let us hold a table",
              subheading:
                "Tell us how many of you there are and what time, and we will take care of the rest. Say so if you would like the terrace.",
              ctaText: "Book a table",
              ctaUrl: "#elaqe",
            },
          ],
        },
      ],
      footer: {
        text: "Yeddi Ocaq · Baku, Sabail. This site is filled with sample content.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp", href: "#" },
        ],
      },
    },

    // ══════════════════════════════════════════════════════════════════════
    //  RU
    // ══════════════════════════════════════════════════════════════════════
    ru: {
      design: "ember",
      siteName: "Yeddi Ocaq",
      nav: [
        { label: "О нас", href: "#haqqimizda" },
        { label: "Меню", href: "#menyu" },
        { label: "Галерея", href: "#qalereya" },
        { label: "Часы работы", href: "#is-saatlari" },
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
              heading: "Азербайджанская кухня на живом огне",
              subheading:
                "Yeddi Ocaq — небольшой зал на пятнадцать столов с открытым дровяным очагом посередине. Меню короткое: всё готовится из мяса и овощей, купленных в то же утро.",
              ctaText: "Забронировать столик",
              ctaUrl: "#elaqe",
            },
            {
              type: "about",
              heading: "Один очаг, один стол",
              body:
                "Очаг стоит в центре зала, и кухню мы не прячем за стеной. Со своего места видно, как шампуры ложатся на угли и как из тандыра достают хлеб. Это не декорация — так еда и готовится, и нам проще, когда вы это видите.\n\nМеню идёт за сезоном. В те месяцы, когда у помидоров нет вкуса, салата из помидоров у нас нет, а в баклажанный сезон баклажан появляется сразу в трёх блюдах. Порции рассчитаны на то, чтобы делиться: поставить несколько тарелок в центр стола и есть из всех — здесь обычное дело. Мы не спешим и не будем торопить вас: ужин должен длиться дольше часа.",
            },
            {
              type: "menu",
              heading: "Меню",
              groups: [
                {
                  name: "Закуски",
                  items: [
                    {
                      name: "Кюкю",
                      desc: "Омлет на зелени — укроп, кинза, зелёный лук. Подаётся с холодным мацони.",
                      price: "11 ₼",
                    },
                    {
                      name: "Кутабы (3 шт.)",
                      desc: "С зеленью, тыквой или рубленой телятиной. Печём на садже и смазываем топлёным маслом.",
                      price: "9 ₼",
                    },
                    {
                      name: "Икра из баклажанов",
                      desc: "Баклажан, подпечённый на углях, с помидором, перцем и чесноком. С тандырным хлебом.",
                      price: "10 ₼",
                    },
                    {
                      name: "Салат «Чобан»",
                      desc: "Мелко нарезанные помидор, огурец, лук и зелень с наршарабом и оливковым маслом.",
                      price: "9 ₼",
                    },
                    {
                      name: "Сырная тарелка с оливками",
                      desc: "Сыры мотал, шор и чеми, оливки, грецкий орех и мёд.",
                      price: "16 ₼",
                    },
                    {
                      name: "Долма в виноградных листьях",
                      desc: "Телятина и баранина в виноградном листе, с чесночным мацони.",
                      price: "15 ₼",
                    },
                  ],
                },
                {
                  name: "Основные блюда",
                  items: [
                    {
                      name: "Пити в глиняном горшочке",
                      desc: "Баранина, нут и курдючное сало, часами томятся в закрытом горшочке. С сумахом и луком.",
                      price: "17 ₼",
                    },
                    {
                      name: "Бугляма из баранины",
                      desc: "Баранина в собственном соку под тяжёлой крышкой, с картофелем и помидорами.",
                      price: "32 ₼",
                    },
                    {
                      name: "Ширин-плов",
                      desc: "Шафранный рис с бараниной, изюмом, курагой и каштанами; газмах подаём отдельно.",
                      price: "26 ₼",
                    },
                    {
                      name: "Баранина на садже",
                      desc: "Обжаривается на чугунном садже с баклажаном, перцем и помидором. Хватает на двоих.",
                      price: "34 ₼",
                    },
                    {
                      name: "Довга",
                      desc: "Тёплый суп на мацони с зеленью, рисом и нутом. Есть вариант с мясными шариками и без.",
                      price: "8 ₼",
                    },
                    {
                      name: "Сибас целиком",
                      desc: "Запекаем с лимоном и зеленью, рядом — овощи с огня.",
                      price: "30 ₼",
                    },
                  ],
                },
                {
                  name: "С углей",
                  items: [
                    {
                      name: "Тикя-кебаб из баранины",
                      desc: "Кусочки корейки, только соль и луковый сок. С луком и сумахом.",
                      price: "22 ₼",
                    },
                    {
                      name: "Люля-кебаб",
                      desc: "Телятина, рубленная вручную, подаём завёрнутой в тандырный хлеб.",
                      price: "14 ₼",
                    },
                    {
                      name: "Кебаб из курицы",
                      desc: "Грудка и крыло вместе, в шафране и мацони.",
                      price: "13 ₼",
                    },
                    {
                      name: "Бараньи рёбра",
                      desc: "Готовим медленно у края очага, чтобы середина осталась сочной. С зёрнами граната.",
                      price: "27 ₼",
                    },
                    {
                      name: "Кебаб из рыбы",
                      desc: "Сезонная белая рыба на шампуре с лавровым листом и лимоном.",
                      price: "24 ₼",
                    },
                    {
                      name: "Овощной кебаб",
                      desc: "Баклажан, перец, помидор и шампиньоны с дымком от углей. Без мяса.",
                      price: "10 ₼",
                    },
                  ],
                },
                {
                  name: "Сладости и чай",
                  items: [
                    {
                      name: "Бакинская пахлава",
                      desc: "Грецкий орех, шафран и медовый сироп. Два ромбика на тарелке.",
                      price: "7 ₼",
                    },
                    {
                      name: "Шекербура",
                      desc: "С лесным орехом и кардамоном, из теста, замешанного утром.",
                      price: "5 ₼",
                    },
                    {
                      name: "Фирни",
                      desc: "Рисовая мука, молоко и шафран, сверху корица. Подаём тёплым.",
                      price: "8 ₼",
                    },
                    {
                      name: "Шекинская халва",
                      desc: "Тонкие нити ришта, лесной орех и сахарный сироп. Одного куска достаточно.",
                      price: "9 ₼",
                    },
                    {
                      name: "Чайный сет",
                      desc: "Чай в стаканах армуду, домашнее варенье, лимон и сухофрукты с орехами.",
                      price: "7 ₼",
                    },
                  ],
                },
              ],
            },
            {
              type: "features",
              heading: "Как у нас устроено",
              subheading:
                "Несколько вещей, о которых лучше знать заранее — тогда вечер пройдёт без сюрпризов.",
              items: [
                {
                  title: "Открытый дровяной очаг",
                  text: "Кебабы и блюда на садже готовятся на очаге в центре зала. Газовых и электрических гриллей у нас нет — поэтому кебаб приходится немного подождать.",
                },
                {
                  title: "Тесто замешиваем утром",
                  text: "Тандырный хлеб, кутабы и тесто для сладостей делаем с утра и печём небольшими партиями в течение дня.",
                },
                {
                  title: "Сезонные овощи",
                  text: "Зелень и овощи покупаем на бакинских рынках в тот же день. Если продукт не в сезоне, его в меню нет до следующего года.",
                },
                {
                  title: "Терраса и закрытый зал",
                  text: "С апреля по октябрь терраса добавляет около 20 мест. Закрытый зал работает круглый год, в любую погоду.",
                },
                {
                  title: "Живая музыка в пятницу и субботу",
                  text: "Вечером играют тар и кяманча — на такой громкости, чтобы за столом можно было спокойно разговаривать.",
                },
                {
                  title: "Компании и торжества",
                  text: "Отдельный зал до 30 гостей. Меню согласовываем заранее, чтобы всё вышло на стол горячим и одновременно.",
                },
              ],
            },
            {
              type: "gallery",
              heading: "Зал и кухня",
              items: [
                { imageUrl: "", caption: "Дровяной очаг в центре зала" },
                { imageUrl: "", caption: "Хлеб из тандыра" },
                { imageUrl: "", caption: "Баранина на шампуре" },
                { imageUrl: "", caption: "Столы на террасе летним вечером" },
                { imageUrl: "", caption: "Пити в горшочке — момент подачи" },
                { imageUrl: "", caption: "Чайный сет и домашнее варенье" },
              ],
            },
            {
              type: "pricing",
              heading: "Сет-меню",
              subheading:
                "Заранее собранные наборы для больших столов. Так кухня готовит всё по одному расписанию, и ожидание сокращается вдвое.",
              items: [
                {
                  name: "Обеденный сет",
                  price: "24 ₼",
                  unit: "с человека",
                  desc: "Только по будням, с 12:00 до 16:00.",
                  features: [
                    "Суп дня: пити или довга",
                    "Одна закуска: кюкю, салат «Чобан» или икра из баклажанов",
                    "Горячее: люля-кебаб, кебаб из курицы или долма",
                    "Тандырный хлеб и зелень",
                    "Чай",
                  ],
                },
                {
                  name: "Сет «Очаг»",
                  price: "45 ₼",
                  unit: "с человека",
                  desc: "Выставляется по центру стола и рассчитан на то, чтобы делиться. Заказ от двух человек.",
                  featured: true,
                  features: [
                    "Четыре закуски: кюкю, икра из баклажанов, салат «Чобан», сырная тарелка",
                    "Ассорти кебабов: тикя из баранины, люля, курица",
                    "Овощи с саджа",
                    "Тандырный хлеб и зелень",
                    "Сладкое: пахлава и шекербура",
                    "Чай с лимоном и домашним вареньем",
                  ],
                },
                {
                  name: "Праздничный стол",
                  price: "68 ₼",
                  unit: "с человека",
                  desc: "Для дней рождения, сговора и семейных встреч. От шести гостей, с подтверждением за день.",
                  features: [
                    "Шесть закусок и две горячие закуски",
                    "Ширин-плов, бугляма из баранины, ассорти кебабов",
                    "Рыба целиком — по желанию",
                    "Тарелка сезонных фруктов",
                    "Сладкое: пахлава, шекербура, шекинская халва",
                    "Чайное обслуживание до конца вечера",
                    "Отдельный зал и расстановка столов",
                  ],
                },
                {
                  name: "Детский сет",
                  price: "14 ₼",
                  unit: "на ребёнка",
                  desc: "Маленькие порции, без острых специй и сильного дыма.",
                  features: [
                    "Небольшой кебаб из курицы или люля",
                    "Картофельное пюре или простой рис",
                    "Огурец и помидор дольками",
                    "Домашний компот",
                  ],
                },
              ],
              note: "Цены указаны на одного человека. К счёту добавляется 10% за обслуживание. Сет-меню просим подтверждать минимум за день.",
            },
            {
              type: "team",
              heading: "Кухня и зал",
              subheading: "Полезно знать, кто чем занимается в зале.",
              items: [
                {
                  name: "Эльчин Мурадлы",
                  role: "Шеф-повар",
                  bio: "Пишет меню под сезон, мясо и рыбу выбирает сам. Бугляма и плов — его работа.",
                },
                {
                  name: "Нармин Сафарова",
                  role: "Второй повар",
                  bio: "Всё, что из теста, на ней: тандырный хлеб, кутабы, пахлава и шекербура.",
                },
                {
                  name: "Руфат Алиев",
                  role: "Мастер очага",
                  bio: "Тот, кто стоит у углей. Решает, сколько соли, когда повернуть шампур и как сильно держать огонь.",
                },
                {
                  name: "Айсель Гадирова",
                  role: "Управляющая залом",
                  bio: "Принимает брони, планирует меню для компаний и встречает вас у входа.",
                },
              ],
            },
            {
              type: "testimonials",
              heading: "Отзывы гостей",
              subheading:
                "Тексты ниже — примеры, написанные для этого шаблона, а не реальные отзывы гостей.",
              items: [
                {
                  quote:
                    "Сели за столик рядом с очагом и до самой подачи смотрели, как готовится наш кебаб. Давно не ел такой простой и такой правильно приготовленной еды.",
                  author: "Камран",
                  role: "Ужин на двоих",
                },
                {
                  quote:
                    "Пришли с семьёй в воскресенье. Для дочери был отдельный сет, официант нас не торопил, и счёт оказался не больше ожидаемого.",
                  author: "Лала",
                  role: "Воскресный обед",
                },
                {
                  quote:
                    "Нас было восемь человек с работы. Меню выбрали заранее — поэтому всё вышло на стол горячим и одновременно.",
                  author: "Турал",
                  role: "Рабочий ужин",
                },
                {
                  quote:
                    "Я вегетарианка и обычно обхожусь двумя позициями. Здесь из кюкю, овощного кебаба и кутабов с зеленью получился полный стол.",
                  author: "Сабина",
                  role: "Гостья",
                },
              ],
            },
            {
              type: "faq",
              heading: "Частые вопросы",
              items: [
                {
                  question: "Нужно ли бронировать столик заранее?",
                  answer:
                    "По будням до 19:00 свободный столик обычно есть. На вечер пятницы и субботы, а также на воскресный обед просим звонить за день. Каждую бронь подтверждаем по телефону или сообщением в WhatsApp.",
                },
                {
                  question: "Принимаете большие компании?",
                  answer:
                    "Да. Для групп больше 10 человек выделяем отдельную часть зала, до 30 гостей — закрытый зал. В этом случае меню согласовываем заранее: варианты есть в разделе сет-меню.",
                },
                {
                  question: "Есть ли где припарковаться?",
                  answer:
                    "Перед зданием есть уличная парковка, но вечером она быстро заполняется. Ближайшая платная стоянка — пять минут пешком; скажите при бронировании, и мы пришлём ориентиры сообщением.",
                },
                {
                  question: "Можно ли прийти с детьми?",
                  answer:
                    "Конечно. Есть детские стульчики, в меню есть детский сет, а открытый очаг находится в дальней от проходов части зала. Вход с коляской — на первом этаже, без ступеней.",
                },
                {
                  question: "Что есть для вегетарианцев и других ограничений?",
                  answer:
                    "Кюкю, икра из баклажанов, салат «Чобан», кутабы с зеленью, овощной кебаб и довга без мяса готовятся полностью без мяса. Если вы не едите глютен, молочное или орехи, скажите до заказа — повар прямо скажет, какие блюда подойдут.",
                },
                {
                  question: "В какие дни живая музыка?",
                  answer:
                    "В пятницу и субботу с 20:00 до 23:00 играют тар и кяманча. В остальные дни в зале только тихая фоновая музыка, разговаривать комфортно.",
                },
                {
                  question: "Можно оплатить картой?",
                  answer:
                    "Да — наличные, Visa и Mastercard, а также бесконтактная оплата телефоном. Если нужно разделить счёт за столом, скажите официанту заранее, и мы подготовим отдельные счета.",
                },
              ],
            },
            {
              type: "hours",
              heading: "Часы работы",
              items: [
                { days: "Понедельник", hours: "12:00 – 23:00" },
                { days: "Вторник", hours: "12:00 – 23:00" },
                { days: "Среда", hours: "12:00 – 23:00" },
                { days: "Четверг", hours: "12:00 – 23:00" },
                { days: "Пятница", hours: "12:00 – 00:30" },
                { days: "Суббота", hours: "11:00 – 00:30" },
                { days: "Воскресенье", hours: "11:00 – 22:00" },
              ],
              note: "Кухня принимает последний заказ за час до закрытия. В дни Новруза и Гурбан байрама часы меняются — уточните по телефону на этой неделе.",
            },
            {
              type: "contact",
              heading: "Как нас найти",
              phone: "+994 12 000 00 00",
              email: "rezervasiya@yeddiocaq.example",
              address: "ул. Хагани 00, Сабаильский район, Баку",
            },
            {
              type: "cta",
              heading: "Оставим столик за вами",
              subheading:
                "Скажите, сколько вас и на какое время, — остальное сделаем мы. Если хотите террасу, тоже отметьте это.",
              ctaText: "Забронировать",
              ctaUrl: "#elaqe",
            },
          ],
        },
      ],
      footer: {
        text: "Yeddi Ocaq · Баку, Сабаил. Сайт заполнен демонстрационным содержанием.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp", href: "#" },
        ],
      },
    },
  },
};
