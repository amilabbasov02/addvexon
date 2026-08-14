/**
 * "lumen" dizaynı üçün nümunə (demo) məzmun — gözəllik salonu.
 *
 * Biznes UYDURMADIR: "Aysən Atelier" real bir salon deyil, telefon, e-poçt və
 * ünvan nümunə dəyərlərdir. Şablon potensial müştəriyə göstərilir, ona görə
 * burada heç bir təsdiq tələb edən iddia yoxdur — nə iş təcrübəsi ili, nə
 * sertifikat, nə müştəri sayı, nə mükafat. Rəylər açıq-aşkar nümunədir.
 *
 * Şəkillər ayrı mərhələdə əlavə olunur — bütün `imageUrl` sahələri buraxılıb.
 * Yeganə istisna `gallery`: `GalleryItem.imageUrl` tipdə məcburidir, ona görə
 * boş sətir kimi saxlanılır və şəkil mərhələsi onu doldurur. `caption` hər
 * kadrın nə olduğunu izah edir.
 */
import type { LocalizedBundle, SiteTheme } from "../../src/lib/site-content";

/* ------------------------------------------------------------------ */
/*  Tema — isti gil (clay) + qaymaq fon; iti künclü redaksiya estetikası */
/* ------------------------------------------------------------------ */

export const lumenTheme: SiteTheme = {
  colors: {
    primary: "#8A5A44",
    bg: "#FBF8F4",
    surface: "#F2EAE1",
    text: "#1C1917",
    muted: "#77685E",
  },
  fonts: {
    heading: "'Cormorant Garamond', Georgia, serif",
    body: "'Jost', system-ui, sans-serif",
  },
};

/* ------------------------------------------------------------------ */
/*  Məzmun                                                             */
/* ------------------------------------------------------------------ */

export const lumenContent: LocalizedBundle = {
  defaultLocale: "az",
  locales: {
    /* ================================ AZ ================================ */
    az: {
      design: "lumen",
      siteName: "Aysən Atelier",
      nav: [
        { label: "Xidmətlər", href: "#xidmetler" },
        { label: "Qalereya", href: "#qalereya" },
        { label: "Qiymətlər", href: "#qiymetler" },
        { label: "İş saatları", href: "#is-saatlari" },
        { label: "Əlaqə", href: "#elaqe" },
      ],
      pages: [
        {
          slug: "",
          title: "Aysən Atelier — Bakıda gözəllik salonu",
          sections: [
            {
              type: "hero",
              heading: "Özünüzə yaraşan görkəm, tələsmədən",
              subheading:
                "Bakının mərkəzində kiçik bir komanda ilə işləyən salon. Saç, dırnaq və üz baxımı — hər müştəriyə ayrı vaxt ayırırıq, ona görə növbədə gözləmək lazım gəlmir.",
              ctaText: "Randevu alın",
              ctaUrl: "#elaqe",
            },
            {
              type: "features",
              heading: "Xidmətlər",
              subheading:
                "Hər xidmət qısa söhbətlə başlayır: nə istədiyinizi dinləyir, saçınızın və dərinizin vəziyyətini birlikdə qiymətləndiririk.",
              items: [
                {
                  title: "Kəsim və forma",
                  text: "Saçın quruluşuna və üz cizgilərinə uyğun kəsim. Evdə asan yığılan, hər gün fen tələb etməyən formalar üzərində işləyirik.",
                  icon: "content_cut",
                },
                {
                  title: "Rəngləmə",
                  text: "Tək tonda boyama, kök korreksiyası, açıqlaşdırma və şəffaf keçidlər. Rəngi seçməzdən əvvəl telin üzərində sınaq nümunəsi göstəririk.",
                  icon: "palette",
                },
                {
                  title: "Saç baxımı və bərpa",
                  text: "Quru, kövrək və boyanmış saç üçün dərin qidalandırıcı qulluq. Prosedurdan sonra evdə davam etmək üçün sadə bir qayda verilir.",
                  icon: "spa",
                },
                {
                  title: "Manikür və pedikür",
                  text: "Klassik və aparat manikürü, gel-lak, dırnaq formasının bərpası. Bütün alətlər hər müştəridən sonra ayrı-ayrı sterilizasiya olunur.",
                  icon: "back_hand",
                },
                {
                  title: "Üz baxımı",
                  text: "Təmizləmə, nəmləndirmə və tonlaşdırma prosedurları. Dəri tipinizə uyğun olmayan heç bir vasitəni sizə təklif etmirik.",
                  icon: "face",
                },
                {
                  title: "Makiyaj və hazırlıq",
                  text: "Gündəlik, axşam və toy makiyajı, saç düzümü ilə birlikdə. Tədbirdən əvvəl istəsəniz sınaq görüşü təşkil edirik.",
                  icon: "brush",
                },
              ],
            },
            {
              type: "about",
              heading: "Salon haqqında",
              body:
                "Aysən Atelier 2019-cu ildə iki stilistin bir kiçik mənzildən başladığı işdir. İlk gündən bir qayda qoymuşduq: eyni vaxta iki müştəri yazılmır. Bu qayda indi də dəyişməyib.\n\nSalon böyük deyil — dörd iş yeri, bir baxım otağı və çay üçün balaca bir künc. Bunun əvəzində hər randevuya lazım olan vaxt ayrılır: söhbət, prosedur, sonra da nəyi necə davam etdirmək barədə izah.\n\nİstifadə etdiyimiz vasitələrin tərkibini soruşmağınızı normal sayırıq və qablarını göstərməkdən çəkinmirik. Nəyin sizə lazım olmadığını da açıq deyirik — bir prosedur sizə fayda vermirsə, onu satmağa çalışmırıq.",
            },
            {
              type: "process",
              heading: "Randevu necə keçir",
              subheading:
                "Dörd sadə mərhələ. Birinci dəfə gəlirsinizsə, ümumi vaxt adətən 15–20 dəqiqə uzun olur.",
              items: [
                {
                  title: "Yazılın",
                  text: "Zəng, WhatsApp və ya Instagram vasitəsilə. Hansı xidməti istədiyinizi və neçəyə qədər vaxtınız olduğunu deyin — qrafiki ona görə qururuq.",
                },
                {
                  title: "Konsultasiya",
                  text: "Kürsüdə oturan kimi saçınıza və dərinizə baxırıq, gətirdiyiniz nümunə şəkilləri birlikdə nəzərdən keçiririk və nəyin real olduğunu deyirik.",
                },
                {
                  title: "Prosedur",
                  text: "İş başlayır. Rəngləmə kimi uzun prosedurlarda mərhələləri əvvəlcədən izah edirik, ona görə nə qədər qalacağını bilirsiniz.",
                },
                {
                  title: "Sonrası",
                  text: "Nəticəni birlikdə yoxlayırıq, evdə baxım üçün qısa tövsiyə veririk və istəsəniz növbəti randevunun təxmini vaxtını qeyd edirik.",
                },
              ],
            },
            {
              type: "gallery",
              heading: "Salondan kadrlar",
              items: [
                { imageUrl: "", caption: "İş yeri və güzgü divarı" },
                { imageUrl: "", caption: "Rəngləmə mərhələsi" },
                { imageUrl: "", caption: "Baxım otağı" },
                { imageUrl: "", caption: "Kəsimdən sonra forma" },
                { imageUrl: "", caption: "Manikür masası" },
                { imageUrl: "", caption: "Gözləmə küncü" },
              ],
            },
            {
              type: "team",
              heading: "Komanda",
              subheading:
                "Dörd nəfərik. Kimin hansı işi daha çox sevdiyini bilirik, ona görə randevunu ustaya görə də seçə bilərsiniz.",
              items: [
                {
                  name: "Aysən",
                  role: "Baş stilist",
                  bio: "Salonun qurucularından biri. Qısa kəsimlər və saçın öz formasına uyğun modellər üzərində işləyir.",
                },
                {
                  name: "Leyla",
                  role: "Rəngləmə üzrə stilist",
                  bio: "Açıqlaşdırma və şəffaf keçidlərlə məşğul olur. Rəngi seçməyə çətinlik çəkirsinizsə, söhbəti onunla başlayın.",
                },
                {
                  name: "Kamran",
                  role: "Kəsim ustası",
                  bio: "Kişi kəsimləri və saqqal forması. Sürətli işləyir, amma tələsdirmir.",
                },
                {
                  name: "Günel",
                  role: "Dırnaq və üz baxımı ustası",
                  bio: "Manikür, pedikür və üz təmizliyi. Həssas dəri ilə işləməyi xüsusi sevir.",
                },
              ],
            },
            {
              type: "pricing",
              heading: "Qiymətlər",
              subheading:
                "Aşağıdakılar ən çox seçilən xidmətlərdir. Tam siyahını salonda və ya telefonla soruşa bilərsiniz.",
              items: [
                {
                  name: "Kəsim və forma",
                  price: "45 ₼",
                  unit: "seansdan",
                  desc: "Yuyulma, kəsim və quruducu ilə forma. Təxminən 1 saat.",
                  features: ["Konsultasiya daxildir", "Yuyulma və qulluq maskası", "Evdə baxım tövsiyəsi"],
                },
                {
                  name: "Kök korreksiyası",
                  price: "70 ₼",
                  unit: "seansdan",
                  desc: "Tək tonda boyama və ya çıxmış kökün bərabərləşdirilməsi. 1,5–2 saat.",
                  features: ["Rəng sınağı", "Boyama və tonlaşdırma", "Yuyulma və forma"],
                },
                {
                  name: "Baxım günü",
                  price: "180 ₼",
                  unit: "paket",
                  desc: "Bir randevuda saç, dırnaq və üz — ardıcıl, tələsmədən. Təxminən 4 saat.",
                  features: [
                    "Kəsim və forma",
                    "Dərin qidalandırıcı saç qulluğu",
                    "Manikür",
                    "Üz təmizliyi və nəmləndirmə",
                    "Çay və fasilə",
                  ],
                  featured: true,
                },
                {
                  name: "Tədbir hazırlığı",
                  price: "120 ₼",
                  unit: "seansdan",
                  desc: "Makiyaj və saç düzümü. Sınaq görüşü ayrıca hesablanır.",
                  features: ["Saç düzümü", "Makiyaj", "Tədbir boyu davamlılıq üçün qeydlər"],
                },
              ],
              note:
                "Qiymətlər saçın uzunluğuna, sıxlığına və istifadə olunan vasitənin miqdarına görə dəyişir. Dəqiq məbləği işə başlamazdan əvvəl, konsultasiyada bildiririk — sonradan əlavə olunan gizli ödəniş yoxdur. Bu, nümunə şablondur; rəqəmlər real qiymət siyahısı deyil.",
            },
            {
              type: "testimonials",
              heading: "Müştərilər nə deyir",
              subheading:
                "Aşağıdaki rəylər şablon üçün hazırlanmış nümunələrdir — real müştəri rəyi deyil.",
              items: [
                {
                  quote:
                    "Uzun müddət saçımı qısa kəsməyə qorxurdum. Burada əvvəlcə üzümə yaraşan uzunluğu birlikdə seçdik, sonra kəsdik. İlk dəfədir ki, evdə də özüm yığa bilirəm.",
                  author: "Nərmin",
                  role: "Nümunə rəy",
                  rating: 5,
                },
                {
                  quote:
                    "Rəngi düzəltmək üçün gəldim, iki mərhələdə edəcəyimizi əvvəlcədən dedilər. Nə vaxt, nə də qiymət gözlədiyimdən artıq olmadı.",
                  author: "Aygün",
                  role: "Nümunə rəy",
                  rating: 5,
                },
                {
                  quote:
                    "Sakit yerdir, arxa fonda musiqi guruldamır. Kəsim 40 dəqiqə çəkdi, saqqalı da düzəltdilər.",
                  author: "Rəşad",
                  role: "Nümunə rəy",
                },
                {
                  quote:
                    "Dərim həssasdır, çox salonda qızartı ilə çıxmışam. Burada hansı vasitəni işlədəcəklərini soruşdum, tərkibini göstərdilər və birini dəyişdilər.",
                  author: "Səbinə",
                  role: "Nümunə rəy",
                },
              ],
            },
            {
              type: "faq",
              heading: "Tez-tez verilən suallar",
              subheading: "Cavabını burada tapmadınızsa, zəng edin — telefonda da izah edirik.",
              items: [
                {
                  question: "Randevunu necə ala bilərəm?",
                  answer:
                    "Telefonla zəng edin və ya eyni nömrəyə WhatsApp yazın. Hansı xidməti istədiyinizi və hansı günlərin sizə uyğun olduğunu bildirin — boş saatları təklif edirik. Təsdiq mesajını göndəririk, randevudan bir gün əvvəl də xatırladırıq.",
                },
                {
                  question: "Randevunu ləğv etsəm və ya gecikəsəm?",
                  answer:
                    "Ləğv etmək üçün ən azı 4 saat əvvəl xəbər verin — bu, vaxtı başqasına təklif etməyə imkan verir. 15 dəqiqəyə qədər gecikmə problem deyil. Daha çox gecikəndə prosedurun bir hissəsini qısaltmalı ola bilərik, çünki növbəti müştərinin vaxtı başlayır.",
                },
                {
                  question: "Randevusuz gəlmək olar?",
                  answer:
                    "Olar, amma zəmanət vermirik. Yer varsa dərhal qəbul edirik; yoxsa həmin gün üçün ən yaxın boş saatı təklif edirik. Kəsim və manikür üçün şansınız daha yüksəkdir, rəngləmə isə uzun vaxt tələb etdiyi üçün adətən əvvəlcədən yazılmalıdır.",
                },
                {
                  question: "Rəngləmə xidmətinə nə daxildir?",
                  answer:
                    "Rəng sınağı, boyanın hazırlanması və vurulması, gözləmə, yuyulma, rəngə uyğun maska və sonda quruducu ilə forma. Kökün çıxma dərəcəsindən asılı olaraq 1,5–3 saat çəkir. Əgər tək seansda istədiyiniz nəticəyə çatmaq saça ziyan verəcəksə, bunu əvvəlcədən deyirik və işi iki randevuya bölürük.",
                },
                {
                  question: "Yaxınlıqda park yeri var?",
                  answer:
                    "Binanın qarşısındaki küçədə ödənişli park xətti var, adətən günorta saatlarında yer tapılır. Axşam saatları daha sıxdır — həmin vaxt üçün yaxındaki dayanacağı və ya metro ilə gəlməyi məsləhət görürük. Randevu təsdiqi ilə birlikdə giriş üçün qısa yol təsvirini də göndəririk.",
                },
                {
                  question: "Ödənişi necə edə bilərəm?",
                  answer:
                    "Nağd və kartla (təmassız daxil olmaqla) ödəniş qəbul edirik. Ödəniş xidmətdən sonra, salonda edilir; qabaqcadan depozit tələb etmirik. Qəbz istəyirsinizsə deyin, çap edirik.",
                },
              ],
            },
            {
              type: "hours",
              heading: "İş saatları",
              items: [
                { days: "Bazar ertəsi", hours: "10:00 – 20:00" },
                { days: "Çərşənbə axşamı", hours: "10:00 – 20:00" },
                { days: "Çərşənbə", hours: "10:00 – 20:00" },
                { days: "Cümə axşamı", hours: "10:00 – 21:00" },
                { days: "Cümə", hours: "10:00 – 21:00" },
                { days: "Şənbə", hours: "09:00 – 21:00" },
                { days: "Bazar", hours: "11:00 – 18:00" },
              ],
              note:
                "Son randevu bağlanma saatından bir saat əvvəl başlayır. Rəsmi bayram günlərində qrafik dəyişir — dəqiqləşdirmək üçün zəng edin.",
            },
            {
              type: "contact",
              heading: "Əlaqə və randevu",
              phone: "+994 12 000 00 00",
              email: "salam@aysen-atelier.example",
              address: "28 May küç. 15, Bakı, Azərbaycan",
            },
            {
              type: "cta",
              heading: "Növbəti həftə üçün yer var",
              subheading:
                "Nə istədiyinizi tam bilmirsinizsə də zəng edin. Telefonda 5 dəqiqəlik söhbət adətən kifayət edir.",
              ctaText: "Zəng edin",
              ctaUrl: "tel:+994120000000",
            },
          ],
        },
      ],
      footer: {
        text: "© 2026 Aysən Atelier — nümunə (demo) sayt. Salon, ünvan, telefon və rəylər şablonu göstərmək üçün uydurulmuşdur.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp", href: "#" },
        ],
      },
    },

    /* ================================ EN ================================ */
    en: {
      design: "lumen",
      siteName: "Aysən Atelier",
      nav: [
        { label: "Services", href: "#xidmetler" },
        { label: "Gallery", href: "#qalereya" },
        { label: "Prices", href: "#qiymetler" },
        { label: "Opening hours", href: "#is-saatlari" },
        { label: "Contact", href: "#elaqe" },
      ],
      pages: [
        {
          slug: "",
          title: "Aysən Atelier — beauty salon in Baku",
          sections: [
            {
              type: "hero",
              heading: "A look that suits you, without the rush",
              subheading:
                "A small salon in central Baku for hair, nails and skin. Every appointment gets its own slot, so nobody waits in a queue while someone else is finished.",
              ctaText: "Book a visit",
              ctaUrl: "#elaqe",
            },
            {
              type: "features",
              heading: "Services",
              subheading:
                "Each service starts with a short conversation: what you want, and what your hair and skin can actually take right now.",
              items: [
                {
                  title: "Cut and shape",
                  text: "A cut built around your hair's texture and the lines of your face. We aim for shapes you can style at home without a blow-dryer every morning.",
                  icon: "content_cut",
                },
                {
                  title: "Colour",
                  text: "Single-tone colour, root touch-ups, lightening and soft transitions. We test the shade on a strand before committing to it.",
                  icon: "palette",
                },
                {
                  title: "Hair treatment",
                  text: "Deep conditioning for dry, brittle or coloured hair. You leave with one simple routine to continue at home, not a shopping list.",
                  icon: "spa",
                },
                {
                  title: "Manicure and pedicure",
                  text: "Classic and machine manicure, gel polish, nail shape repair. Tools are sterilised individually after every client.",
                  icon: "back_hand",
                },
                {
                  title: "Facials",
                  text: "Cleansing, hydrating and toning treatments. If a product does not match your skin type, we will not put it on your face.",
                  icon: "face",
                },
                {
                  title: "Make-up and events",
                  text: "Daytime, evening and wedding make-up, with styling if you want both. A trial session before the day can be arranged.",
                  icon: "brush",
                },
              ],
            },
            {
              type: "about",
              heading: "About the salon",
              body:
                "Aysən Atelier started in 2019, when two stylists began working out of a small flat. One rule was set on day one: never two clients booked into the same slot. That rule has not changed.\n\nThe salon is not large — four working stations, one treatment room and a small corner for tea. What it has instead is time: a conversation, the service itself, and then a proper explanation of how to keep the result.\n\nAsking what is in a product is completely normal here, and we are happy to show you the bottle. We are just as direct about what you do not need — if a treatment will not do anything for you, we say so instead of selling it.",
            },
            {
              type: "process",
              heading: "How a visit works",
              subheading:
                "Four steps. If it is your first time, expect the whole thing to run 15–20 minutes longer.",
              items: [
                {
                  title: "Book",
                  text: "Call, WhatsApp or message us on Instagram. Tell us which service you want and how much time you have — we build the slot around that.",
                },
                {
                  title: "Consultation",
                  text: "We look at your hair and skin, go through any reference photos you brought, and tell you honestly which parts are realistic today.",
                },
                {
                  title: "The service",
                  text: "Work begins. For longer services such as colour we explain the stages up front, so you know how long you will be in the chair.",
                },
                {
                  title: "Afterwards",
                  text: "We check the result together, give you a short home-care routine, and note a rough date for the next visit if you want one.",
                },
              ],
            },
            {
              type: "gallery",
              heading: "Inside the salon",
              items: [
                { imageUrl: "", caption: "Working station and mirror wall" },
                { imageUrl: "", caption: "Colour in progress" },
                { imageUrl: "", caption: "Treatment room" },
                { imageUrl: "", caption: "Shape after a cut" },
                { imageUrl: "", caption: "Manicure table" },
                { imageUrl: "", caption: "Waiting corner" },
              ],
            },
            {
              type: "team",
              heading: "The team",
              subheading:
                "There are four of us. We each have work we enjoy most, so you are welcome to book by name.",
              items: [
                {
                  name: "Aysən",
                  role: "Lead stylist",
                  bio: "One of the two founders. Works mostly on short cuts and shapes that follow the hair's own direction.",
                },
                {
                  name: "Leyla",
                  role: "Colour stylist",
                  bio: "Lightening and soft transitions. If choosing a shade is the hard part, start the conversation with her.",
                },
                {
                  name: "Kamran",
                  role: "Barber",
                  bio: "Men's cuts and beard shaping. Fast, but never in a hurry to get you out of the chair.",
                },
                {
                  name: "Günel",
                  role: "Nails and skin",
                  bio: "Manicure, pedicure and facials. Particularly likes working with sensitive skin.",
                },
              ],
            },
            {
              type: "pricing",
              heading: "Prices",
              subheading:
                "These are the services people book most often. Ask us in the salon or by phone for the full list.",
              items: [
                {
                  name: "Cut and shape",
                  price: "45 ₼",
                  unit: "from, per visit",
                  desc: "Wash, cut and blow-dry. Around one hour.",
                  features: ["Consultation included", "Wash and treatment mask", "Home-care advice"],
                },
                {
                  name: "Root touch-up",
                  price: "70 ₼",
                  unit: "from, per visit",
                  desc: "Single-tone colour or evening out grown-out roots. 1.5–2 hours.",
                  features: ["Strand test", "Colour and toning", "Wash and blow-dry"],
                },
                {
                  name: "Care day",
                  price: "180 ₼",
                  unit: "package",
                  desc: "Hair, nails and skin in one visit, one after another, unhurried. Around four hours.",
                  features: [
                    "Cut and shape",
                    "Deep conditioning treatment",
                    "Manicure",
                    "Cleansing and hydrating facial",
                    "Tea and a break",
                  ],
                  featured: true,
                },
                {
                  name: "Event preparation",
                  price: "120 ₼",
                  unit: "from, per visit",
                  desc: "Make-up and styling. A trial session is charged separately.",
                  features: ["Styling", "Make-up", "Notes on keeping it through the day"],
                },
              ],
              note:
                "Prices depend on hair length, density and how much product a service needs. You get the exact figure at the consultation, before any work starts — nothing is added afterwards. This is a demo template; the numbers are not a real price list.",
            },
            {
              type: "testimonials",
              heading: "What clients say",
              subheading:
                "The reviews below are written examples for this template — they are not real client feedback.",
              items: [
                {
                  quote:
                    "I had been scared of cutting my hair short for years. Here we picked the length together first and cut afterwards. It is the first time I can actually style it myself at home.",
                  author: "Nərmin",
                  role: "Sample review",
                  rating: 5,
                },
                {
                  quote:
                    "I came in to fix a colour and was told up front it would take two visits. Neither the time nor the price went past what I was quoted.",
                  author: "Aygün",
                  role: "Sample review",
                  rating: 5,
                },
                {
                  quote:
                    "Quiet place, no music thumping in the background. The cut took forty minutes and they tidied the beard as well.",
                  author: "Rəşad",
                  role: "Sample review",
                },
                {
                  quote:
                    "My skin is sensitive and I have left plenty of salons red. I asked what they were about to use, they showed me the ingredients and swapped one product.",
                  author: "Səbinə",
                  role: "Sample review",
                },
              ],
            },
            {
              type: "faq",
              heading: "Frequently asked questions",
              subheading: "If your question is not here, call us — we are happy to explain by phone.",
              items: [
                {
                  question: "How do I book an appointment?",
                  answer:
                    "Call the salon or send a WhatsApp message to the same number. Tell us the service you want and which days suit you, and we will offer the open slots. You get a confirmation message, plus a reminder the day before.",
                },
                {
                  question: "What if I need to cancel or I am running late?",
                  answer:
                    "Please let us know at least four hours ahead so the slot can be offered to someone else. Up to fifteen minutes late is not a problem. Beyond that we may have to shorten part of the service, because the next client's time starts on schedule.",
                },
                {
                  question: "Do you take walk-ins?",
                  answer:
                    "Yes, but we cannot promise a chair. If someone is free you go straight in; if not, we offer the nearest open slot that day. Cuts and manicures are the likeliest to fit, while colour usually needs booking ahead because it takes hours.",
                },
                {
                  question: "What is included in a colour service?",
                  answer:
                    "A strand test, mixing and applying the colour, the waiting time, rinsing, a mask suited to the shade, and a blow-dry at the end. It takes 1.5–3 hours depending on how much regrowth there is. If reaching your target shade in one sitting would damage the hair, we tell you beforehand and split the work across two visits.",
                },
                {
                  question: "Is there parking nearby?",
                  answer:
                    "There is paid street parking on the road in front of the building, and spaces are usually free around midday. Evenings are busier, so for those slots we suggest the nearby car park or coming by metro. We send short walking directions together with your booking confirmation.",
                },
                {
                  question: "How can I pay?",
                  answer:
                    "Cash and card, contactless included. Payment happens after the service, in the salon — we do not ask for a deposit up front. Say the word and we will print a receipt.",
                },
              ],
            },
            {
              type: "hours",
              heading: "Opening hours",
              items: [
                { days: "Monday", hours: "10:00 – 20:00" },
                { days: "Tuesday", hours: "10:00 – 20:00" },
                { days: "Wednesday", hours: "10:00 – 20:00" },
                { days: "Thursday", hours: "10:00 – 21:00" },
                { days: "Friday", hours: "10:00 – 21:00" },
                { days: "Saturday", hours: "09:00 – 21:00" },
                { days: "Sunday", hours: "11:00 – 18:00" },
              ],
              note:
                "The last appointment starts one hour before closing. Hours change on public holidays — call to check.",
            },
            {
              type: "contact",
              heading: "Contact and booking",
              phone: "+994 12 000 00 00",
              email: "salam@aysen-atelier.example",
              address: "28 May küç. 15, Baku, Azerbaijan",
            },
            {
              type: "cta",
              heading: "There is room next week",
              subheading:
                "Call even if you are not sure what you want yet. Five minutes on the phone is usually enough to figure it out.",
              ctaText: "Call the salon",
              ctaUrl: "tel:+994120000000",
            },
          ],
        },
      ],
      footer: {
        text: "© 2026 Aysən Atelier — demo site. The salon, address, phone number and reviews are invented to show the template.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp", href: "#" },
        ],
      },
    },

    /* ================================ RU ================================ */
    ru: {
      design: "lumen",
      siteName: "Aysən Atelier",
      nav: [
        { label: "Услуги", href: "#xidmetler" },
        { label: "Галерея", href: "#qalereya" },
        { label: "Цены", href: "#qiymetler" },
        { label: "Часы работы", href: "#is-saatlari" },
        { label: "Контакты", href: "#elaqe" },
      ],
      pages: [
        {
          slug: "",
          title: "Aysən Atelier — салон красоты в Баку",
          sections: [
            {
              type: "hero",
              heading: "Образ, который вам идёт — без спешки",
              subheading:
                "Небольшой салон в центре Баку: волосы, ногти, уход за лицом. На каждую запись выделено своё время, поэтому в очереди ждать не приходится.",
              ctaText: "Записаться",
              ctaUrl: "#elaqe",
            },
            {
              type: "features",
              heading: "Услуги",
              subheading:
                "Любая услуга начинается с короткого разговора: чего вы хотите и что сейчас реально выдержат ваши волосы и кожа.",
              items: [
                {
                  title: "Стрижка и форма",
                  text: "Стрижка под структуру волос и черты лица. Стараемся делать формы, которые вы уложите дома и без ежедневного фена.",
                  icon: "content_cut",
                },
                {
                  title: "Окрашивание",
                  text: "Окрашивание в один тон, коррекция корней, осветление и мягкие переходы. Прежде чем выбрать оттенок, проверяем его на пряди.",
                  icon: "palette",
                },
                {
                  title: "Уход и восстановление",
                  text: "Глубокое питание для сухих, ломких и окрашенных волос. После процедуры получаете один простой домашний уход, а не список покупок.",
                  icon: "spa",
                },
                {
                  title: "Маникюр и педикюр",
                  text: "Классический и аппаратный маникюр, гель-лак, восстановление формы ногтя. Инструменты стерилизуются индивидуально после каждого клиента.",
                  icon: "back_hand",
                },
                {
                  title: "Уход за лицом",
                  text: "Очищение, увлажнение, тонизирование. Средство, которое не подходит вашему типу кожи, мы на лицо не нанесём.",
                  icon: "face",
                },
                {
                  title: "Макияж и подготовка к событию",
                  text: "Дневной, вечерний и свадебный макияж, при желании вместе с укладкой. Пробную встречу до события можно назначить заранее.",
                  icon: "brush",
                },
              ],
            },
            {
              type: "about",
              heading: "О салоне",
              body:
                "Aysən Atelier начался в 2019 году: два стилиста работали в небольшой квартире. С первого дня было одно правило — двух клиентов на одно и то же время не записываем. Правило действует до сих пор.\n\nСалон небольшой: четыре рабочих места, один кабинет ухода и маленький угол для чая. Зато на каждую запись есть время — разговор, сама процедура и подробное объяснение, как сохранить результат.\n\nСпрашивать о составе средств здесь нормально, и мы спокойно показываем упаковку. Так же прямо говорим и о том, что вам не нужно: если процедура ничего вам не даст, мы её не продаём.",
            },
            {
              type: "process",
              heading: "Как проходит визит",
              subheading:
                "Четыре шага. Если вы у нас впервые, весь визит обычно длиннее на 15–20 минут.",
              items: [
                {
                  title: "Запись",
                  text: "По телефону, в WhatsApp или в Instagram. Скажите, какая услуга нужна и сколько у вас времени — под это и подберём слот.",
                },
                {
                  title: "Консультация",
                  text: "Смотрим волосы и кожу, разбираем принесённые вами фото и честно говорим, что из этого выполнимо сегодня.",
                },
                {
                  title: "Процедура",
                  text: "Приступаем к работе. Для длительных услуг вроде окрашивания заранее объясняем этапы, чтобы вы знали, сколько просидите в кресле.",
                },
                {
                  title: "После",
                  text: "Вместе проверяем результат, даём короткий домашний уход и, если хотите, отмечаем примерную дату следующего визита.",
                },
              ],
            },
            {
              type: "gallery",
              heading: "Салон изнутри",
              items: [
                { imageUrl: "", caption: "Рабочее место и зеркальная стена" },
                { imageUrl: "", caption: "Процесс окрашивания" },
                { imageUrl: "", caption: "Кабинет ухода" },
                { imageUrl: "", caption: "Форма после стрижки" },
                { imageUrl: "", caption: "Маникюрный стол" },
                { imageUrl: "", caption: "Уголок ожидания" },
              ],
            },
            {
              type: "team",
              heading: "Команда",
              subheading:
                "Нас четверо. У каждого есть работа, которую он любит больше, поэтому записаться можно и к конкретному мастеру.",
              items: [
                {
                  name: "Айсан",
                  role: "Ведущий стилист",
                  bio: "Одна из двух основательниц. В основном короткие стрижки и формы, которые идут за собственным направлением волос.",
                },
                {
                  name: "Лейла",
                  role: "Стилист по окрашиванию",
                  bio: "Осветление и мягкие переходы. Если сложнее всего выбрать оттенок — начните разговор с ней.",
                },
                {
                  name: "Камран",
                  role: "Мастер мужской стрижки",
                  bio: "Стрижка и оформление бороды. Работает быстро, но не торопит.",
                },
                {
                  name: "Гюнель",
                  role: "Мастер ногтей и ухода за лицом",
                  bio: "Маникюр, педикюр, чистка лица. Особенно любит работать с чувствительной кожей.",
                },
              ],
            },
            {
              type: "pricing",
              heading: "Цены",
              subheading:
                "Здесь то, что заказывают чаще всего. Полный список спросите в салоне или по телефону.",
              items: [
                {
                  name: "Стрижка и укладка",
                  price: "45 ₼",
                  unit: "от, за визит",
                  desc: "Мытьё, стрижка и укладка феном. Около часа.",
                  features: ["Консультация включена", "Мытьё и уходовая маска", "Рекомендации по домашнему уходу"],
                },
                {
                  name: "Коррекция корней",
                  price: "70 ₼",
                  unit: "от, за визит",
                  desc: "Окрашивание в один тон или выравнивание отросших корней. 1,5–2 часа.",
                  features: ["Проверка на пряди", "Окрашивание и тонирование", "Мытьё и укладка"],
                },
                {
                  name: "День ухода",
                  price: "180 ₼",
                  unit: "пакет",
                  desc: "Волосы, ногти и лицо за один визит, одно за другим, без спешки. Около четырёх часов.",
                  features: [
                    "Стрижка и укладка",
                    "Глубокий питательный уход для волос",
                    "Маникюр",
                    "Чистка и увлажнение лица",
                    "Чай и перерыв",
                  ],
                  featured: true,
                },
                {
                  name: "Подготовка к событию",
                  price: "120 ₼",
                  unit: "от, за визит",
                  desc: "Макияж и укладка. Пробная встреча считается отдельно.",
                  features: ["Укладка", "Макияж", "Советы, как сохранить образ до конца дня"],
                },
              ],
              note:
                "Цена зависит от длины и густоты волос и от расхода средств. Точную сумму называем на консультации, до начала работы, — потом ничего не добавляется. Это демонстрационный шаблон, цифры не являются настоящим прайсом.",
            },
            {
              type: "testimonials",
              heading: "Что говорят клиенты",
              subheading:
                "Отзывы ниже — примеры, написанные для шаблона. Это не реальные отзывы клиентов.",
              items: [
                {
                  quote:
                    "Годами боялась стричься коротко. Здесь сначала вместе выбрали длину, а потом стригли. Впервые получается укладывать самой дома.",
                  author: "Нармин",
                  role: "Пример отзыва",
                  rating: 5,
                },
                {
                  quote:
                    "Пришла исправлять цвет, и сразу сказали, что это два визита. Ни время, ни сумма не вышли за то, о чём договорились.",
                  author: "Айгюн",
                  role: "Пример отзыва",
                  rating: 5,
                },
                {
                  quote:
                    "Тихое место, музыка не гремит. Стрижка заняла сорок минут, бороду тоже поправили.",
                  author: "Рашад",
                  role: "Пример отзыва",
                },
                {
                  quote:
                    "Кожа чувствительная, из многих салонов уходила с покраснением. Спросила, чем будут работать, — показали состав и одно средство заменили.",
                  author: "Сабина",
                  role: "Пример отзыва",
                },
              ],
            },
            {
              type: "faq",
              heading: "Частые вопросы",
              subheading: "Если вашего вопроса здесь нет — позвоните, объясним по телефону.",
              items: [
                {
                  question: "Как записаться?",
                  answer:
                    "Позвоните в салон или напишите в WhatsApp на тот же номер. Скажите, какая услуга нужна и какие дни вам удобны, — предложим свободные слоты. Пришлём подтверждение, а за день до визита — напоминание.",
                },
                {
                  question: "Что если нужно отменить запись или я опаздываю?",
                  answer:
                    "Сообщите хотя бы за четыре часа: тогда время можно предложить другому человеку. Опоздание до пятнадцати минут не проблема. Если больше, часть процедуры возможно придётся сократить — время следующего клиента начинается по расписанию.",
                },
                {
                  question: "Можно прийти без записи?",
                  answer:
                    "Можно, но место не гарантируем. Если мастер свободен, принимаем сразу; если нет — предложим ближайший свободный слот в тот же день. Со стрижкой и маникюром шансов больше, а на окрашивание лучше записываться заранее: оно занимает несколько часов.",
                },
                {
                  question: "Что входит в окрашивание?",
                  answer:
                    "Проверка на пряди, смешивание и нанесение краски, выдержка, смывание, маска под выбранный оттенок и укладка в конце. Занимает 1,5–3 часа в зависимости от отросших корней. Если добиться нужного цвета за один раз можно только в ущерб волосам, мы говорим об этом заранее и делим работу на два визита.",
                },
                {
                  question: "Есть ли парковка рядом?",
                  answer:
                    "Перед зданием есть платная парковка вдоль улицы, днём место обычно находится. Вечером плотнее, поэтому на вечерние слоты советуем соседний паркинг или метро. Короткое описание, как дойти, отправляем вместе с подтверждением записи.",
                },
                {
                  question: "Как можно оплатить?",
                  answer:
                    "Наличными и картой, в том числе бесконтактно. Оплата после услуги, в салоне; предоплату не берём. Скажите — распечатаем чек.",
                },
              ],
            },
            {
              type: "hours",
              heading: "Часы работы",
              items: [
                { days: "Понедельник", hours: "10:00 – 20:00" },
                { days: "Вторник", hours: "10:00 – 20:00" },
                { days: "Среда", hours: "10:00 – 20:00" },
                { days: "Четверг", hours: "10:00 – 21:00" },
                { days: "Пятница", hours: "10:00 – 21:00" },
                { days: "Суббота", hours: "09:00 – 21:00" },
                { days: "Воскресенье", hours: "11:00 – 18:00" },
              ],
              note:
                "Последняя запись — за час до закрытия. В государственные праздники график меняется, уточняйте по телефону.",
            },
            {
              type: "contact",
              heading: "Контакты и запись",
              phone: "+994 12 000 00 00",
              email: "salam@aysen-atelier.example",
              address: "ул. 28 Мая 15, Баку, Азербайджан",
            },
            {
              type: "cta",
              heading: "На следующую неделю есть места",
              subheading:
                "Звоните, даже если пока не решили, чего хотите. Пяти минут по телефону обычно достаточно.",
              ctaText: "Позвонить",
              ctaUrl: "tel:+994120000000",
            },
          ],
        },
      ],
      footer: {
        text: "© 2026 Aysən Atelier — демонстрационный сайт. Салон, адрес, телефон и отзывы придуманы, чтобы показать шаблон.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp", href: "#" },
        ],
      },
    },
  },
};
