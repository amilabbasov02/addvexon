/**
 * Demo məzmunu — "meridian" dizaynı, diş klinikası.
 *
 * "Ağçinar Diş Klinikası" TAMAMİLƏ UYDURMA bir klinikadır. Telefon nömrələri,
 * e-poçt (`.example` — sənədləşmə üçün ayrılmış domen) və ünvan qəsdən
 * doldurulası boşluqdur; rəylər nümunə mətnidir.
 *
 * Tibb sahəsi olduğu üçün burada bir qayda var və ona istisna yoxdur:
 * YOXLANILA BİLƏN HEÇ BİR İDDİA UYDURULMUR. Yəni bu faylda yoxdur və olmamalıdır:
 *   - lisenziya / sertifikat nömrəsi, assosiasiya üzvlüyü
 *   - universitet, təhsil yeri, "N il təcrübə"
 *   - müalicə uğuru faizi, pasiyent sayı, "ağrısız zəmanət"
 * Həkim yazıları yalnız ad + vəzifə + neytral, iddiasız təsvirdir. Statistika
 * bölməsi klinik deyil: xidmət istiqamətlərinin sayı, qəbulun uzunluğu, dillər.
 * Bunları real klinika öz doğru məlumatı ilə əvəz edir — şablon heç kəsə
 * uydurmağı öyrətməməlidir.
 *
 * Şəkillər ayrı mərhələdə əlavə olunur, ona görə `imageUrl` sahələri yoxdur.
 */
import type { LocalizedBundle, SiteTheme } from "../../src/lib/site-content";

/**
 * Sakit, klinik, amma soyuq olmayan palitra. Mətn rəngi ağ fonda yüksək
 * kontrastlıdır, `muted` isə surface üzərində də AA-nı keçir — pasiyentlər
 * çox vaxt yaşlı olur, oxunaqlıq bəzəkdən üstündür.
 */
export const meridianTheme: SiteTheme = {
  colors: {
    primary: "#16697a",
    bg: "#ffffff",
    surface: "#f2f6f7",
    text: "#14252b",
    muted: "#566a71",
  },
  fonts: {
    heading: "'Newsreader', Georgia, 'Times New Roman', serif",
    body: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },
};

export const meridianContent: LocalizedBundle = {
  defaultLocale: "az",
  locales: {
    // ================================================================
    //  AZ
    // ================================================================
    az: {
      design: "meridian",
      siteName: "Ağçinar Diş Klinikası",
      nav: [
        { label: "Xidmətlər", href: "#xidmetler" },
        { label: "Həkimlər", href: "#komanda" },
        { label: "Qiymətlər", href: "#qiymetler" },
        { label: "İş saatları", href: "#is-saatlari" },
        { label: "Əlaqə", href: "#elaqe" },
      ],
      pages: [
        {
          slug: "",
          title: "Ağçinar Diş Klinikası — Bakıda diş müalicəsi və profilaktika",
          sections: [
            {
              type: "hero",
              heading: "Diş həkiminə getmək qorxulu olmamalıdır",
              subheading:
                "Hər müalicə müayinə və izahatla başlayır. Nə edəcəyimizi, nə qədər vaxt aparacağını və nə qədər ödəyəcəyinizi işə başlamadan öncə bilirsiniz.",
              ctaText: "Növbəyə yazılın",
              ctaUrl: "#elaqe",
            },

            {
              type: "features",
              heading: "Xidmətlər",
              subheading:
                "Aşağıdakı izahları sadə dildə yazdıq. Hansı xidmətin sizə lazım olduğunu bilmirsinizsə, bu normaldır — müayinədə bunu birlikdə aydınlaşdırırıq.",
              items: [
                {
                  title: "Müayinə və diaqnostika",
                  text: "Həkim dişlərinizi və diş ətinizi baxır, lazım gələrsə rentgen çəkir. Məqsəd problemin nə olduğunu və nədən başlamağın doğru olduğunu dəqiqləşdirməkdir. Müayinədən sonra heç nəyə razılıq verməyə məcbur deyilsiniz.",
                  icon: "clinical_notes",
                },
                {
                  title: "Kariyes müalicəsi və dolğu",
                  text: "Dişdə çürümüş hissə təmizlənir və yeri dişin rənginə uyğun materialla bərpa olunur. Adətən bir qəbulda tamamlanır. Ağrını azaltmaq üçün yerli keyitmə təklif olunur.",
                  icon: "dentistry",
                },
                {
                  title: "Kanal müalicəsi",
                  text: "Çürümə dişin dərinliyinə, sinirə çatanda kanal təmizlənir və doldurulur. Bu, dişi çəkmək əvəzinə saxlamaq üçün edilir. Bir neçə qəbul lazım ola bilər — sayını həkim müayinədən sonra deyir.",
                  icon: "healing",
                },
                {
                  title: "Peşəkar təmizləmə və profilaktika",
                  text: "Diş daşı və ərp təmizlənir, diş əti vəziyyəti yoxlanılır. Evdə fırçanın çatmadığı yerlər üçündür. Həkim sizə hansı fırça və hansı üsulla təmizləməyin uyğun olduğunu göstərir.",
                  icon: "cleaning_services",
                },
                {
                  title: "Ortodontiya — braket və şəffaf plastinlər",
                  text: "Əyri dişlərin və düzgün olmayan qapanmanın tədricən düzəldilməsi. Uzunmüddətli prosesdir və aylıq nəzarət qəbulları tələb edir. İlkin müayinədə hansı variantların sizə uyğun olduğunu izah edirik.",
                  icon: "straighten",
                },
                {
                  title: "Uşaq stomatologiyası",
                  text: "Uşaq üçün ilk qəbul çox vaxt müalicə deyil, tanışlıqdır: uşaq kabinetə girir, alətlərə baxır, həkimlə danışır. Valideyn yanında ola bilər. Tələsdirmirik.",
                  icon: "child_care",
                },
              ],
            },

            {
              type: "stats",
              items: [
                { value: "6", label: "əsas xidmət istiqaməti" },
                { value: "40 dəq", label: "ilkin müayinə üçün ayrılan vaxt" },
                { value: "3 dil", label: "qəbul dilləri: Azərbaycan, rus, ingilis" },
                { value: "6 gün", label: "həftədə qəbul günü" },
              ],
            },

            {
              type: "about",
              heading: "Klinika haqqında",
              body:
                "Ağçinar kiçik bir klinikadır və bunu üstünlük sayırıq: eyni vaxtda salonda çox adam olmur, qəbullar arasında vaxt ayrılır, tələsmək ehtiyacı yaranmır.\n\nİşimizi bir prinsip üzərində qurmuşuq — pasiyent nə olduğunu bilməlidir. Müayinədən sonra həkim vəziyyəti sadə dillə izah edir, variantları sadalayır, hər variantın nə qədər vaxt və nə qədər pul aparacağını deyir. Qərarı siz verirsiniz. Lazım olmayan müalicəni təklif etmirik və \"indi razılaşmasanız gec olar\" kimi təzyiq göstərmirik.\n\nAğrıdan qorxmaq təbiidir. Bunu qəbulun başında həkimə deyin — iş temposu, keyitmə və fasilələr buna uyğun qurulur. Prosedur zamanı narahat olsanız, əlinizi qaldırın, dayanırıq.\n\nQeyd: bu səhifə nümunə məzmunla doldurulub. Klinika öz məlumatını, öz komandasını və öz qiymətlərini bu bölmələrin yerinə yazır.",
            },

            {
              type: "process",
              heading: "İlk qəbul necə keçir",
              subheading: "Dörd addım. Gözlənilməz heç nə olmasın deyə hər birini əvvəlcədən yazdıq.",
              items: [
                {
                  title: "Növbəyə yazılırsınız",
                  text: "Telefonla zəng edin və ya mesaj yazın. Sizdən adınızı, şikayətinizi bir cümlə ilə və hansı gün-saatın rahat olduğunu soruşurlar. Ağrı varsa bunu deyin — belə hallara mümkün olan ən yaxın vaxt verilir.",
                },
                {
                  title: "Müayinə və lazımsa rentgen",
                  text: "Həkim dişləri və diş ətini yoxlayır. Səthdən görünməyən yerlər üçün rentgen lazım ola bilər; şəkli sizinlə birlikdə ekranda baxırıq. Bu addımda hələ müalicə başlamır.",
                },
                {
                  title: "Plan və qiymət danışılır",
                  text: "Nə tapıldığı, nədən başlamağın vacib olduğu, nəyin gözləyə biləcəyi izah olunur. Hər mərhələnin qiyməti və təxmini qəbul sayı yazılı şəkildə verilir. Sual verməkdən çəkinməyin, cavab vermək qəbulun bir hissəsidir.",
                },
                {
                  title: "Müalicə və sonrakı baxış",
                  text: "Razılaşdığınız plan üzrə işə başlanır. Qəbulun sonunda evdə nə etmək lazım olduğu — nə vaxt yemək, ağrı olarsa nə etmək — sizə deyilir. Növbəti nəzarət baxışının vaxtı orada təyin olunur.",
                },
              ],
            },

            {
              type: "team",
              heading: "Həkimlərimiz",
              subheading:
                "Aşağıdakı adlar nümunədir. Klinika bu bölməyə öz həkimlərinin adını, vəzifəsini və istəsə təhsil-təcrübə məlumatını — yalnız doğru olanı — yazır.",
              items: [
                {
                  name: "Nərmin Əliyeva",
                  role: "Stomatoloq-terapevt",
                  bio: "Kariyes müalicəsi, dolğu və profilaktika ilə məşğul olur. Qəbulda hər addımı əvvəlcədən izah etməyi vacib sayır.",
                },
                {
                  name: "Rəşad Hüseynov",
                  role: "Stomatoloq-cərrah",
                  bio: "Diş çəkilməsi və cərrahi qəbullar üzrə işləyir. Prosedurdan sonrakı qayğı barədə göstərişləri yazılı verir.",
                },
                {
                  name: "Aygün Səfərova",
                  role: "Uşaq stomatoloqu",
                  bio: "Uşaqlarla qəbulları aparır. İlk görüşü tanışlıq kimi qurur, uşağı tələsdirməmək prinsipi ilə çalışır.",
                },
                {
                  name: "Elçin Quliyev",
                  role: "Ortodont",
                  bio: "Braket sistemləri və şəffaf plastinlərlə düzəltmə qəbullarını aparır. Nəzarət görüşlərinin cədvəlini pasiyentlə birlikdə planlaşdırır.",
                },
              ],
            },

            {
              type: "pricing",
              heading: "Qiymətlər",
              subheading:
                "Ən çox verilən sual budur, ona görə səhifədə açıq yazırıq. Aşağıdakılar başlanğıc qiymətlərdir — dəqiq məbləğ müayinədən sonra bəlli olur.",
              items: [
                {
                  name: "İlkin müayinə və məsləhət",
                  price: "20 ₼",
                  unit: "qəbul üçün",
                  desc: "Baxış, vəziyyətin izahı və yazılı müalicə planı. Bundan sonra davam etmək qərarı sizindir.",
                  features: [
                    "Təxminən 40 dəqiqə",
                    "Yazılı plan və qiymət hesabatı",
                    "Müalicəyə razılıq vermək tələb olunmur",
                  ],
                },
                {
                  name: "Peşəkar diş təmizləmə",
                  price: "70 ₼-dan",
                  unit: "seansdan",
                  desc: "Diş daşının və ərpin təmizlənməsi, diş ətinin yoxlanılması, evdə gigiyena üzrə göstərişlər.",
                  features: [
                    "Adətən bir seans",
                    "Diş əti vəziyyətinin qiymətləndirilməsi",
                    "Fırça və üsul üzrə tövsiyə",
                  ],
                },
                {
                  name: "Kariyes müalicəsi və dolğu",
                  price: "80 ₼-dan",
                  unit: "bir dişdən",
                  desc: "Çürümüş toxumanın təmizlənməsi və dişin rənginə uyğun materialla bərpası. Qiymət dişin vəziyyətindən və zədənin ölçüsündən asılıdır.",
                  features: [
                    "Yerli keyitmə imkanı",
                    "Adətən bir qəbulda tamamlanır",
                    "Prosedurdan sonra yazılı göstərişlər",
                  ],
                  featured: true,
                },
                {
                  name: "Kanal müalicəsi",
                  price: "150 ₼-dan",
                  unit: "bir kanaldan",
                  desc: "Dişi çəkmək əvəzinə saxlamaq üçün aparılan müalicə. Kanalların sayı və dişin vəziyyəti qiyməti dəyişir.",
                  features: [
                    "Bir neçə qəbul lazım ola bilər",
                    "Hər mərhələ əvvəlcədən izah olunur",
                    "Nəzarət baxışı planlaşdırılır",
                  ],
                },
              ],
              note:
                "Qiymətlər ilkin məlumat üçündür və müqavilə təklifi deyil. Dəqiq məbləğ yalnız müayinədən sonra, dişin faktiki vəziyyətinə görə hesablanır və işə başlamadan öncə sizə yazılı verilir. Gizli əlavə ödəniş yoxdur.",
            },

            {
              type: "testimonials",
              heading: "Pasiyent rəyləri",
              subheading:
                "Aşağıdakı rəylər nümunə mətndir və real deyil. Klinika bu bölməni öz pasiyentlərinin icazə ilə verdiyi rəyləri ilə əvəz edir.",
              items: [
                {
                  quote:
                    "Nə edəcəklərini əvvəlcədən izah etdilər, qiyməti də kağızda yazdılar. Sonda söylənən məbləğ danışılandan fərqli olmadı.",
                  author: "Səbinə M.",
                  role: "Pasiyent (nümunə rəy)",
                  rating: 5,
                },
                {
                  quote:
                    "Uşağı ilk dəfə aparanda müalicə etmədilər, sadəcə tanış oldular. İkinci qəbula özü getdi.",
                  author: "Kamran R.",
                  role: "Valideyn (nümunə rəy)",
                  rating: 5,
                },
                {
                  quote:
                    "Diş həkimindən qorxduğumu dedim, tələsmədilər və arada dayandılar. Suallarıma sonuna qədər cavab verdilər.",
                  author: "Lalə H.",
                  role: "Pasiyent (nümunə rəy)",
                  rating: 4,
                },
                {
                  quote:
                    "Təyin olunan saatda qəbul etdilər, gözləmədim. Qəbuldan sonra evdə nə edəcəyimi yazıb verdilər.",
                  author: "Tural A.",
                  role: "Pasiyent (nümunə rəy)",
                  rating: 5,
                },
              ],
            },

            {
              type: "faq",
              heading: "Tez-tez verilən suallar",
              subheading: "Telefonda ən çox soruşulanlar. Cavablar qısa və şişirtmə olmadan.",
              items: [
                {
                  question: "Ağrıyacaq?",
                  answer:
                    "Dürüst cavab: prosedurdan və dişin vəziyyətindən asılıdır. Əksər müalicələr yerli keyitmə ilə aparılır və keyitmə işlədikdən sonra ağrı adətən hiss olunmur, təzyiq və səs isə hiss olunur.\n\nHeç bir klinika \"tam ağrısız\" zəmanəti verə bilməz və biz də vermirik. Vəd edə biləcəyimiz budur: qəbuldan öncə nə olacağını izah edirik, keyitmə variantlarını danışırıq və prosedur zamanı narahat olduğunuzu bildirsəniz dayanırıq.",
                },
                {
                  question: "Keyitmə (anesteziya) var?",
                  answer:
                    "Bəli, müalicələr üçün yerli keyitmə mövcuddur və əksər hallarda təklif olunur. Keyitmədən öncə həkim sizdən dərman allergiyası, hamiləlik, qəbul etdiyiniz dərmanlar və xroniki xəstəliklər barədə soruşur — bu sualları ötürməyin, cavablar seçimi dəyişir.\n\nKeçmişdə keyitmədən sonra pis olmuşsa, bunu mütləq deyin.",
                },
                {
                  question: "Nə qədər başa gəlir?",
                  answer:
                    "Səhifədəki \"Qiymətlər\" bölməsində başlanğıc məbləğlər göstərilib. Dəqiq qiymət yalnız müayinədən sonra bilinir, çünki eyni şikayət fərqli adamlarda fərqli iş həcmi deməkdir.\n\nMüayinədən sonra planı və hər mərhələnin qiymətini yazılı alırsınız. İşə başlamazdan əvvəl razılığınız soruşulur; sonradan üstünə əlavə çıxmır.",
                },
                {
                  question: "Hissə-hissə ödəniş mümkündür?",
                  answer:
                    "Uzun müalicələrdə ödənişi mərhələlərə bölmək mümkündür — hər qəbulun sonunda o mərhələnin haqqı ödənilir. Şərtləri müalicə planı ilə birlikdə əvvəlcədən yazılı danışırıq.\n\nBank kreditləri və taksit kartları barədə isə şərtlər dəyişkəndir, ona görə burada dəqiq söz vermirik: zəng edib hazırda hansı ödəniş üsullarının qəbul olunduğunu soruşun.",
                },
                {
                  question: "Müalicə nə qədər davam edir?",
                  answer:
                    "Sadə dolğu adətən bir qəbulda, təmizləmə bir seansda tamamlanır. Kanal müalicəsi bir neçə qəbul tələb edə bilər. Ortodontik müalicə isə uzun prosesdir və aylıq nəzarət görüşləri ilə davam edir.\n\nQəbul sayının təxminini müayinədən sonra alırsınız. Təxmin dəyişərsə, səbəbi sizə izah olunur.",
                },
                {
                  question: "Uşağı gətirmək olar? Neçə yaşdan?",
                  answer:
                    "Bəli, uşaq qəbulları var. İlk süd dişləri çıxandan sonra profilaktik baxış üçün gətirmək olar; dəqiq vaxtı telefonda soruşun.\n\nİlk görüş çox vaxt müalicəsiz keçir: uşaq mühitə alışır, alətlərə baxır, həkimlə danışır. Valideyn kabinetdə yanında ola bilər. Uşağı qorxutmamaq üçün \"ağrımayacaq\" kimi vədlər vermirik — nə olacağını yaşına uyğun dillə izah edirik.",
                },
                {
                  question: "Əvvəlcədən növbə yazılmalıdır, yoxsa elə gəlmək olar?",
                  answer:
                    "Növbə ilə gəlmək daha rahatdır: hər pasiyentə ayrıca vaxt ayrılır və gözləmə olmur. Telefonla zəng edin və ya mesaj yazın.\n\nAğrı ilə müraciət edirsinizsə, bunu ilk cümlədə deyin — belə hallar üçün gündə vaxt saxlanılır və mümkün olan ən yaxın saat verilir. Növbəsiz gəlsəniz də geri qaytarılmırsınız, sadəcə gözləmək lazım gələ bilər.",
                },
              ],
            },

            {
              type: "hours",
              heading: "İş saatları",
              items: [
                { days: "Bazar ertəsi", hours: "09:00 – 19:00" },
                { days: "Çərşənbə axşamı", hours: "09:00 – 19:00" },
                { days: "Çərşənbə", hours: "09:00 – 19:00" },
                { days: "Cümə axşamı", hours: "09:00 – 19:00" },
                { days: "Cümə", hours: "09:00 – 19:00" },
                { days: "Şənbə", hours: "10:00 – 16:00" },
                { days: "Bazar", hours: "Bağlıdır" },
              ],
              note:
                "Son qəbul bağlanışdan 45 dəqiqə əvvəl götürülür. Bayram günlərində cədvəl dəyişir — gəlməzdən əvvəl zəng edib yoxlayın.",
            },

            {
              type: "contact",
              heading: "Əlaqə və növbə",
              phone: "+994 12 000 00 00",
              email: "salam@agcinar.example",
              address: "Bakı, Nəsimi rayonu, Nümunə küçəsi 1, 2-ci mərtəbə",
            },

            {
              type: "cta",
              heading: "Sualınız varsa, əvvəlcə soruşun",
              subheading:
                "Növbə yazmaq üçün qərar vermiş olmağınız lazım deyil. Zəng edin, vəziyyətinizi danışın — hansı qəbulun uyğun olduğunu birlikdə seçək.",
              ctaText: "Növbəyə yazılın",
              ctaUrl: "#elaqe",
            },
          ],
        },
      ],
      footer: {
        text:
          "Bakıda diş müalicəsi və profilaktika. Bu sayt nümunə məzmunla doldurulub: klinika adı, əlaqə məlumatları, həkim adları və rəylər uydurmadır və real klinika tərəfindən öz doğru məlumatı ilə əvəz olunmalıdır.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp", href: "#" },
        ],
      },
    },

    // ================================================================
    //  EN
    // ================================================================
    en: {
      design: "meridian",
      siteName: "Ağçinar Dental Clinic",
      nav: [
        { label: "Services", href: "#xidmetler" },
        { label: "Doctors", href: "#komanda" },
        { label: "Prices", href: "#qiymetler" },
        { label: "Opening hours", href: "#is-saatlari" },
        { label: "Contact", href: "#elaqe" },
      ],
      pages: [
        {
          slug: "",
          title: "Ağçinar Dental Clinic — dental treatment and prevention in Baku",
          sections: [
            {
              type: "hero",
              heading: "Going to the dentist should not be frightening",
              subheading:
                "Every treatment starts with an examination and an explanation. You know what we plan to do, how long it will take and what it will cost before any work begins.",
              ctaText: "Book an appointment",
              ctaUrl: "#elaqe",
            },

            {
              type: "features",
              heading: "Services",
              subheading:
                "We have written these descriptions in plain language. If you do not know which service you need, that is normal — we work it out together at the examination.",
              items: [
                {
                  title: "Examination and diagnosis",
                  text: "The dentist checks your teeth and gums and takes an X-ray if needed. The point is to establish what the problem is and what it makes sense to start with. You are not obliged to agree to anything after the examination.",
                  icon: "clinical_notes",
                },
                {
                  title: "Treating decay and fillings",
                  text: "The decayed part of the tooth is cleaned out and rebuilt with a material matched to your tooth colour. Usually finished in one appointment. Local anaesthetic is offered to reduce pain.",
                  icon: "dentistry",
                },
                {
                  title: "Root canal treatment",
                  text: "When decay reaches deep into the tooth and the nerve, the canal is cleaned and sealed. This is done to keep the tooth instead of removing it. It may take several appointments — the dentist tells you how many after the examination.",
                  icon: "healing",
                },
                {
                  title: "Professional cleaning and prevention",
                  text: "Tartar and plaque are removed and the condition of your gums is checked. It covers the places a brush cannot reach at home. The dentist shows you which brush and which technique suit you.",
                  icon: "cleaning_services",
                },
                {
                  title: "Orthodontics — braces and clear aligners",
                  text: "Gradual correction of crooked teeth and a bite that does not close properly. It is a long process and needs monthly check-ups. At the first examination we explain which options are suitable for you.",
                  icon: "straighten",
                },
                {
                  title: "Children's dentistry",
                  text: "A child's first appointment is often not treatment but an introduction: the child comes into the room, looks at the instruments, talks to the dentist. A parent can stay in the room. We do not rush.",
                  icon: "child_care",
                },
              ],
            },

            {
              type: "stats",
              items: [
                { value: "6", label: "main areas of care" },
                { value: "40 min", label: "time set aside for a first examination" },
                { value: "3", label: "languages at appointments: Azerbaijani, Russian, English" },
                { value: "6 days", label: "open per week" },
              ],
            },

            {
              type: "about",
              heading: "About the clinic",
              body:
                "Ağçinar is a small clinic, and we treat that as an advantage: the waiting area is never crowded, there is time between appointments, and nobody needs to hurry.\n\nOur work rests on one principle — the patient should know what is going on. After the examination the dentist explains the situation in plain words, lists the options, and says how much time and money each option takes. The decision is yours. We do not propose treatment you do not need, and we do not use pressure such as \"if you do not agree now it will be too late\".\n\nBeing afraid of pain is normal. Say so at the start of the appointment — the pace of work, the anaesthetic and the breaks are arranged around it. If you feel uncomfortable during a procedure, raise your hand and we stop.\n\nPlease note: this page is filled with sample content. A real clinic replaces these sections with its own information, its own team and its own prices.",
            },

            {
              type: "process",
              heading: "How a first visit works",
              subheading: "Four steps. We wrote each one down in advance so nothing comes as a surprise.",
              items: [
                {
                  title: "You book an appointment",
                  text: "Call or send a message. You will be asked for your name, your complaint in one sentence, and which day and time suit you. If you are in pain, say so — those cases are given the earliest slot available.",
                },
                {
                  title: "Examination, and an X-ray if needed",
                  text: "The dentist checks your teeth and gums. An X-ray may be needed for what cannot be seen from the surface; we look at the image together on the screen. Treatment does not start at this step.",
                },
                {
                  title: "The plan and the price are discussed",
                  text: "You hear what was found, what is important to start with and what can wait. You get the price of each stage and an estimate of how many appointments it needs, in writing. Do not hesitate to ask questions — answering them is part of the appointment.",
                },
                {
                  title: "Treatment and a follow-up check",
                  text: "Work begins according to the plan you agreed to. At the end of the appointment you are told what to do at home — when you can eat, what to do if it hurts. The date of the next check is set there and then.",
                },
              ],
            },

            {
              type: "team",
              heading: "Our doctors",
              subheading:
                "The names below are placeholders. A clinic fills this section with the names and roles of its own dentists, and, if it wishes, their education and experience — only what is true.",
              items: [
                {
                  name: "Nərmin Əliyeva",
                  role: "General dentist",
                  bio: "Works on treating decay, fillings and prevention. Considers it important to explain each step before it happens.",
                },
                {
                  name: "Rəşad Hüseynov",
                  role: "Dental surgeon",
                  bio: "Handles extractions and surgical appointments. Gives after-care instructions in writing.",
                },
                {
                  name: "Aygün Səfərova",
                  role: "Children's dentist",
                  bio: "Runs appointments with children. Treats the first visit as an introduction and works on the principle of not rushing a child.",
                },
                {
                  name: "Elçin Quliyev",
                  role: "Orthodontist",
                  bio: "Runs appointments involving braces and clear aligners. Plans the schedule of check-ups together with the patient.",
                },
              ],
            },

            {
              type: "pricing",
              heading: "Prices",
              subheading:
                "This is the question we are asked most, so we put it on the page. The figures below are starting prices — the exact amount is known after the examination.",
              items: [
                {
                  name: "First examination and consultation",
                  price: "20 ₼",
                  unit: "per appointment",
                  desc: "Examination, an explanation of the situation and a written treatment plan. Whether to continue after that is your decision.",
                  features: [
                    "About 40 minutes",
                    "Written plan and price breakdown",
                    "No obligation to agree to treatment",
                  ],
                },
                {
                  name: "Professional cleaning",
                  price: "from 70 ₼",
                  unit: "per session",
                  desc: "Removal of tartar and plaque, a check of your gums, and instructions for hygiene at home.",
                  features: [
                    "Usually one session",
                    "Assessment of gum condition",
                    "Advice on brush and technique",
                  ],
                },
                {
                  name: "Decay treatment and filling",
                  price: "from 80 ₼",
                  unit: "per tooth",
                  desc: "Removal of decayed tissue and rebuilding the tooth with a colour-matched material. The price depends on the state of the tooth and the size of the damage.",
                  features: [
                    "Local anaesthetic available",
                    "Usually finished in one appointment",
                    "Written after-care instructions",
                  ],
                  featured: true,
                },
                {
                  name: "Root canal treatment",
                  price: "from 150 ₼",
                  unit: "per canal",
                  desc: "Treatment carried out to keep the tooth rather than remove it. The number of canals and the state of the tooth change the price.",
                  features: [
                    "May need several appointments",
                    "Every stage explained beforehand",
                    "A follow-up check is scheduled",
                  ],
                },
              ],
              note:
                "Prices are indicative and are not a binding offer. The exact amount can only be calculated after an examination, based on the actual condition of the tooth, and is given to you in writing before any work starts. There are no hidden extras.",
            },

            {
              type: "testimonials",
              heading: "Patient reviews",
              subheading:
                "The reviews below are sample text and are not real. A clinic replaces this section with reviews its own patients have given permission to publish.",
              items: [
                {
                  quote:
                    "They explained what they were going to do beforehand and wrote the price down on paper. The final amount was the same as the one we agreed on.",
                  author: "Səbinə M.",
                  role: "Patient (sample review)",
                  rating: 5,
                },
                {
                  quote:
                    "The first time I brought my child there was no treatment, they just got to know each other. He walked in on his own for the second appointment.",
                  author: "Kamran R.",
                  role: "Parent (sample review)",
                  rating: 5,
                },
                {
                  quote:
                    "I said I was afraid of dentists, so they did not rush and stopped for breaks. They answered all my questions to the end.",
                  author: "Lalə H.",
                  role: "Patient (sample review)",
                  rating: 4,
                },
                {
                  quote:
                    "I was seen at the time I was given, with no waiting. After the appointment they wrote down what I should do at home.",
                  author: "Tural A.",
                  role: "Patient (sample review)",
                  rating: 5,
                },
              ],
            },

            {
              type: "faq",
              heading: "Frequently asked questions",
              subheading: "The questions we hear most on the phone. Short answers, no marketing.",
              items: [
                {
                  question: "Will it hurt?",
                  answer:
                    "The honest answer: it depends on the procedure and on the state of the tooth. Most treatment is done with a local anaesthetic, and once it takes effect pain is usually not felt, though pressure and noise are.\n\nNo clinic can guarantee that treatment is completely painless, and we do not make that claim. What we can promise: we explain what will happen before we start, we discuss the anaesthetic options, and if you tell us you are uncomfortable during the procedure, we stop.",
                },
                {
                  question: "Is anaesthetic available?",
                  answer:
                    "Yes, local anaesthetic is available for treatment and is offered in most cases. Before it is given, the dentist will ask about drug allergies, pregnancy, medication you are taking and any long-term conditions — do not skip those questions, the answers change what is used.\n\nIf you have felt unwell after an anaesthetic in the past, be sure to mention it.",
                },
                {
                  question: "How much does it cost?",
                  answer:
                    "Starting prices are shown in the \"Prices\" section on this page. The exact price is only known after an examination, because the same complaint means a different amount of work in different people.\n\nAfter the examination you receive the plan and the price of each stage in writing. Your agreement is asked for before work starts; nothing is added afterwards.",
                },
                {
                  question: "Can I pay in instalments?",
                  answer:
                    "For long courses of treatment the payment can be split by stage — you pay for each stage at the end of that appointment. The terms are agreed in writing in advance, together with the treatment plan.\n\nBank loans and instalment cards are a different matter and the terms change, so we will not promise anything specific here: please call and ask which payment methods are accepted at the moment.",
                },
                {
                  question: "How long does treatment take?",
                  answer:
                    "A simple filling is usually done in one appointment and a cleaning in one session. Root canal treatment may need several appointments. Orthodontic treatment is a long process and continues with monthly check-ups.\n\nYou get an estimate of the number of appointments after the examination. If the estimate changes, you are told why.",
                },
                {
                  question: "Can I bring my child? From what age?",
                  answer:
                    "Yes, we see children. You can bring a child for a preventive check once the first milk teeth have come through; ask on the phone about the right timing.\n\nThe first visit often involves no treatment at all: the child gets used to the room, looks at the instruments, talks to the dentist. A parent can stay with them. We do not make promises like \"it will not hurt\" to a child — we explain what will happen in language suited to their age.",
                },
                {
                  question: "Do I need an appointment, or can I just come in?",
                  answer:
                    "Booking is easier: each patient is given their own slot, so there is no waiting. Call or send a message.\n\nIf you are coming with pain, say so in your first sentence — time is kept free each day for those cases and you are given the earliest slot available. If you arrive without an appointment you will not be turned away, but you may have to wait.",
                },
              ],
            },

            {
              type: "hours",
              heading: "Opening hours",
              items: [
                { days: "Monday", hours: "09:00 – 19:00" },
                { days: "Tuesday", hours: "09:00 – 19:00" },
                { days: "Wednesday", hours: "09:00 – 19:00" },
                { days: "Thursday", hours: "09:00 – 19:00" },
                { days: "Friday", hours: "09:00 – 19:00" },
                { days: "Saturday", hours: "10:00 – 16:00" },
                { days: "Sunday", hours: "Closed" },
              ],
              note:
                "The last appointment is taken 45 minutes before closing. Hours change on public holidays — please call to check before you travel.",
            },

            {
              type: "contact",
              heading: "Contact and appointments",
              phone: "+994 12 000 00 00",
              email: "salam@agcinar.example",
              address: "Baku, Nasimi district, Numuna street 1, 2nd floor",
            },

            {
              type: "cta",
              heading: "If you have a question, ask it first",
              subheading:
                "You do not have to have made up your mind to call. Ring us, describe your situation, and we will work out together which appointment fits.",
              ctaText: "Book an appointment",
              ctaUrl: "#elaqe",
            },
          ],
        },
      ],
      footer: {
        text:
          "Dental treatment and prevention in Baku. This site is filled with sample content: the clinic name, contact details, doctors' names and reviews are invented and must be replaced by a real clinic with its own accurate information.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp", href: "#" },
        ],
      },
    },

    // ================================================================
    //  RU
    // ================================================================
    ru: {
      design: "meridian",
      siteName: "Стоматология «Ağçinar»",
      nav: [
        { label: "Услуги", href: "#xidmetler" },
        { label: "Врачи", href: "#komanda" },
        { label: "Цены", href: "#qiymetler" },
        { label: "Часы работы", href: "#is-saatlari" },
        { label: "Контакты", href: "#elaqe" },
      ],
      pages: [
        {
          slug: "",
          title: "Стоматология «Ağçinar» — лечение и профилактика зубов в Баку",
          sections: [
            {
              type: "hero",
              heading: "Идти к стоматологу не должно быть страшно",
              subheading:
                "Любое лечение начинается с осмотра и объяснения. Вы знаете, что мы собираемся делать, сколько это займёт времени и сколько будет стоить, ещё до начала работы.",
              ctaText: "Записаться на приём",
              ctaUrl: "#elaqe",
            },

            {
              type: "features",
              heading: "Услуги",
              subheading:
                "Описания написаны простым языком. Если вы не знаете, какая услуга вам нужна, — это нормально: разберёмся вместе на осмотре.",
              items: [
                {
                  title: "Осмотр и диагностика",
                  text: "Врач осматривает зубы и дёсны, при необходимости делает снимок. Задача — понять, в чём проблема и с чего разумно начать. После осмотра вы не обязаны на что-либо соглашаться.",
                  icon: "clinical_notes",
                },
                {
                  title: "Лечение кариеса и пломбы",
                  text: "Разрушенную часть зуба убирают, а место восстанавливают материалом под цвет зуба. Обычно укладывается в один приём. Для уменьшения боли предлагается местная анестезия.",
                  icon: "dentistry",
                },
                {
                  title: "Лечение каналов",
                  text: "Когда разрушение доходит до глубины зуба и нерва, канал очищают и пломбируют. Это делают, чтобы сохранить зуб, а не удалять его. Может понадобиться несколько приёмов — их число врач называет после осмотра.",
                  icon: "healing",
                },
                {
                  title: "Профессиональная чистка и профилактика",
                  text: "Снимают камень и налёт, проверяют состояние дёсен. Это про те места, куда домашняя щётка не достаёт. Врач покажет, какая щётка и какая техника подходят именно вам.",
                  icon: "cleaning_services",
                },
                {
                  title: "Ортодонтия — брекеты и прозрачные капы",
                  text: "Постепенное исправление неровных зубов и неправильного смыкания. Процесс длительный, требует ежемесячных контрольных приёмов. На первом осмотре объясняем, какие варианты вам подходят.",
                  icon: "straighten",
                },
                {
                  title: "Детская стоматология",
                  text: "Первый приём для ребёнка часто не лечение, а знакомство: ребёнок заходит в кабинет, смотрит на инструменты, разговаривает с врачом. Родитель может быть рядом. Мы не торопим.",
                  icon: "child_care",
                },
              ],
            },

            {
              type: "stats",
              items: [
                { value: "6", label: "основных направления помощи" },
                { value: "40 мин", label: "времени отведено на первый осмотр" },
                { value: "3", label: "языка приёма: азербайджанский, русский, английский" },
                { value: "6 дней", label: "приём в неделю" },
              ],
            },

            {
              type: "about",
              heading: "О клинике",
              body:
                "«Ağçinar» — небольшая клиника, и мы считаем это преимуществом: в холле не бывает много людей, между приёмами есть запас времени, спешить не приходится.\n\nНаша работа держится на одном принципе — пациент должен понимать, что происходит. После осмотра врач простыми словами объясняет ситуацию, перечисляет варианты и говорит, сколько времени и денег потребует каждый. Решение принимаете вы. Мы не предлагаем ненужное лечение и не давим фразами вроде «не согласитесь сейчас — будет поздно».\n\nБояться боли — нормально. Скажите об этом в начале приёма: темп работы, анестезия и паузы подстраиваются под это. Если во время процедуры станет неприятно, поднимите руку — мы остановимся.\n\nОбратите внимание: страница заполнена демонстрационным текстом. Реальная клиника заменяет эти разделы своей информацией, своей командой и своими ценами.",
            },

            {
              type: "process",
              heading: "Как проходит первый приём",
              subheading: "Четыре шага. Мы описали каждый заранее, чтобы не было неожиданностей.",
              items: [
                {
                  title: "Вы записываетесь",
                  text: "Позвоните или напишите. Вас спросят имя, жалобу в одну фразу и удобный день и час. Если есть боль — скажите об этом: для таких обращений дают самое близкое свободное время.",
                },
                {
                  title: "Осмотр и снимок, если он нужен",
                  text: "Врач проверяет зубы и дёсны. Для того, что не видно с поверхности, может понадобиться снимок; смотрим его вместе с вами на экране. Лечение на этом шаге ещё не начинается.",
                },
                {
                  title: "Обсуждаем план и цену",
                  text: "Вам объясняют, что нашли, с чего важно начать и что может подождать. Стоимость каждого этапа и примерное число приёмов вы получаете в письменном виде. Не стесняйтесь спрашивать — отвечать на вопросы входит в приём.",
                },
                {
                  title: "Лечение и контрольный визит",
                  text: "Работа начинается по согласованному плану. В конце приёма вам скажут, что делать дома: когда можно есть, что делать, если будет болеть. Дату следующего контроля назначают сразу.",
                },
              ],
            },

            {
              type: "team",
              heading: "Наши врачи",
              subheading:
                "Имена ниже — это заполнитель. Клиника вписывает сюда имена и должности своих врачей, а при желании и сведения об образовании и опыте — только достоверные.",
              items: [
                {
                  name: "Нармин Алиева",
                  role: "Стоматолог-терапевт",
                  bio: "Занимается лечением кариеса, пломбами и профилактикой. Считает важным объяснять каждый шаг заранее.",
                },
                {
                  name: "Рашад Гусейнов",
                  role: "Стоматолог-хирург",
                  bio: "Ведёт удаления и хирургические приёмы. Рекомендации по уходу после процедуры даёт в письменном виде.",
                },
                {
                  name: "Айгюн Сафарова",
                  role: "Детский стоматолог",
                  bio: "Ведёт приёмы с детьми. Первый визит строит как знакомство и работает по принципу «ребёнка не торопить».",
                },
                {
                  name: "Эльчин Кулиев",
                  role: "Ортодонт",
                  bio: "Ведёт приёмы с брекет-системами и прозрачными капами. График контрольных визитов планирует вместе с пациентом.",
                },
              ],
            },

            {
              type: "pricing",
              heading: "Цены",
              subheading:
                "Это самый частый вопрос, поэтому мы пишем о нём открыто. Ниже — начальные суммы; точная сумма становится известна после осмотра.",
              items: [
                {
                  name: "Первичный осмотр и консультация",
                  price: "20 ₼",
                  unit: "за приём",
                  desc: "Осмотр, объяснение ситуации и письменный план лечения. Продолжать или нет — решаете вы.",
                  features: [
                    "Около 40 минут",
                    "Письменный план и расчёт стоимости",
                    "Соглашаться на лечение не обязательно",
                  ],
                },
                {
                  name: "Профессиональная чистка",
                  price: "от 70 ₼",
                  unit: "за сеанс",
                  desc: "Снятие камня и налёта, проверка состояния дёсен, рекомендации по домашней гигиене.",
                  features: [
                    "Обычно один сеанс",
                    "Оценка состояния дёсен",
                    "Совет по щётке и технике чистки",
                  ],
                },
                {
                  name: "Лечение кариеса и пломба",
                  price: "от 80 ₼",
                  unit: "за один зуб",
                  desc: "Удаление разрушенных тканей и восстановление зуба материалом под его цвет. Цена зависит от состояния зуба и размера поражения.",
                  features: [
                    "Возможна местная анестезия",
                    "Обычно за один приём",
                    "Письменные рекомендации после процедуры",
                  ],
                  featured: true,
                },
                {
                  name: "Лечение канала",
                  price: "от 150 ₼",
                  unit: "за один канал",
                  desc: "Лечение, которое проводят, чтобы сохранить зуб, а не удалять его. Цену меняют число каналов и состояние зуба.",
                  features: [
                    "Может потребоваться несколько приёмов",
                    "Каждый этап объясняют заранее",
                    "Назначается контрольный визит",
                  ],
                },
              ],
              note:
                "Цены приведены для ориентира и не являются публичной офертой. Точную сумму можно рассчитать только после осмотра, исходя из фактического состояния зуба; её выдают вам в письменном виде до начала работы. Скрытых доплат нет.",
            },

            {
              type: "testimonials",
              heading: "Отзывы пациентов",
              subheading:
                "Отзывы ниже — демонстрационный текст, они не настоящие. Клиника заменяет этот раздел отзывами своих пациентов, данными с их согласия.",
              items: [
                {
                  quote:
                    "Объяснили заранее, что будут делать, и написали цену на бумаге. Итоговая сумма не отличалась от той, о которой договорились.",
                  author: "Сабина М.",
                  role: "Пациент (демо-отзыв)",
                  rating: 5,
                },
                {
                  quote:
                    "Когда привела ребёнка в первый раз, лечить не стали — просто познакомились. На второй приём он зашёл сам.",
                  author: "Камран Р.",
                  role: "Родитель (демо-отзыв)",
                  rating: 5,
                },
                {
                  quote:
                    "Я сказала, что боюсь стоматологов, — не торопились и делали паузы. На все вопросы ответили до конца.",
                  author: "Лала Г.",
                  role: "Пациент (демо-отзыв)",
                  rating: 4,
                },
                {
                  quote:
                    "Приняли в назначенное время, ждать не пришлось. После приёма написали, что делать дома.",
                  author: "Турал А.",
                  role: "Пациент (демо-отзыв)",
                  rating: 5,
                },
              ],
            },

            {
              type: "faq",
              heading: "Частые вопросы",
              subheading: "О чём чаще всего спрашивают по телефону. Коротко и без рекламы.",
              items: [
                {
                  question: "Будет больно?",
                  answer:
                    "Честный ответ: зависит от процедуры и состояния зуба. Большинство лечения проводят с местной анестезией, и после того как она подействует, боль обычно не чувствуется, а давление и звук — чувствуются.\n\nНи одна клиника не может гарантировать «полностью без боли», и мы такого не обещаем. Обещаем другое: до начала объясняем, что будет происходить, обсуждаем варианты анестезии, и если во время процедуры вы скажете, что вам неприятно, — останавливаемся.",
                },
                {
                  question: "Анестезия есть?",
                  answer:
                    "Да, местная анестезия доступна и в большинстве случаев предлагается. Перед ней врач спросит об аллергии на лекарства, беременности, принимаемых препаратах и хронических заболеваниях — не пропускайте эти вопросы, от ответов зависит выбор.\n\nЕсли раньше после анестезии вам становилось плохо, обязательно скажите об этом.",
                },
                {
                  question: "Сколько это стоит?",
                  answer:
                    "Начальные суммы указаны в разделе «Цены» на этой странице. Точная цена известна только после осмотра: одна и та же жалоба у разных людей означает разный объём работы.\n\nПосле осмотра вы получаете план и стоимость каждого этапа в письменном виде. Согласие спрашивают до начала работы; ничего не добавляют потом.",
                },
                {
                  question: "Можно платить частями?",
                  answer:
                    "При длительном лечении оплату можно разбить по этапам — за каждый этап вы платите в конце соответствующего приёма. Условия обговариваем письменно заранее, вместе с планом лечения.\n\nПро банковские кредиты и карты рассрочки условия меняются, поэтому здесь мы ничего конкретного не обещаем: позвоните и спросите, какие способы оплаты принимаются сейчас.",
                },
                {
                  question: "Сколько длится лечение?",
                  answer:
                    "Простая пломба обычно за один приём, чистка — за один сеанс. Лечение канала может потребовать нескольких приёмов. Ортодонтическое лечение — длительный процесс с ежемесячными контрольными визитами.\n\nПримерное число приёмов вы узнаёте после осмотра. Если оценка изменится, вам объяснят причину.",
                },
                {
                  question: "Можно с ребёнком? С какого возраста?",
                  answer:
                    "Да, детские приёмы есть. На профилактический осмотр можно приводить после появления первых молочных зубов; о подходящем времени спросите по телефону.\n\nПервый визит часто проходит без лечения: ребёнок привыкает к кабинету, смотрит на инструменты, говорит с врачом. Родитель может быть рядом. Мы не обещаем ребёнку, что «не будет больно», — объясняем, что будет происходить, языком, понятным в его возрасте.",
                },
                {
                  question: "Нужно записываться заранее или можно просто прийти?",
                  answer:
                    "По записи удобнее: на каждого пациента выделено своё время, и ждать не приходится. Позвоните или напишите.\n\nЕсли обращаетесь с болью, скажите об этом первой фразой — на такие случаи каждый день оставляют время и дают ближайший свободный час. Без записи вас не отправят обратно, но, возможно, придётся подождать.",
                },
              ],
            },

            {
              type: "hours",
              heading: "Часы работы",
              items: [
                { days: "Понедельник", hours: "09:00 – 19:00" },
                { days: "Вторник", hours: "09:00 – 19:00" },
                { days: "Среда", hours: "09:00 – 19:00" },
                { days: "Четверг", hours: "09:00 – 19:00" },
                { days: "Пятница", hours: "09:00 – 19:00" },
                { days: "Суббота", hours: "10:00 – 16:00" },
                { days: "Воскресенье", hours: "Закрыто" },
              ],
              note:
                "Последний приём берут за 45 минут до закрытия. В праздничные дни график меняется — позвоните и уточните перед визитом.",
            },

            {
              type: "contact",
              heading: "Контакты и запись",
              phone: "+994 12 000 00 00",
              email: "salam@agcinar.example",
              address: "Баку, Насиминский район, улица Нумуна 1, 2-й этаж",
            },

            {
              type: "cta",
              heading: "Если есть вопрос — сначала спросите",
              subheading:
                "Чтобы позвонить, не нужно быть готовым к решению. Позвоните, расскажите о своей ситуации — вместе выберем подходящий приём.",
              ctaText: "Записаться на приём",
              ctaUrl: "#elaqe",
            },
          ],
        },
      ],
      footer: {
        text:
          "Лечение и профилактика зубов в Баку. Сайт заполнен демонстрационным содержимым: название клиники, контакты, имена врачей и отзывы вымышлены и должны быть заменены реальной клиникой на её собственные достоверные данные.",
        socials: [
          { label: "Instagram", href: "#" },
          { label: "Facebook", href: "#" },
          { label: "WhatsApp", href: "#" },
        ],
      },
    },
  },
};
