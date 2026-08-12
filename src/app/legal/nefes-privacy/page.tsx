import { LegalArticle, LegalSection } from "@/components/site/LegalArticle";
import { BRAND } from "@/lib/brand";
import { SITE_URL } from "@/lib/seo";

// «Nəfəs» mobil tətbiqinin məxfilik siyasəti.
//
// AYRICA SƏHİFƏDİR: `/privacy` saytın öz xidmətinə (hazır saytlar + hosting)
// aiddir və orada hesab, ödəniş, tenant məlumatlarından danışılır — mobil
// tətbiqə heç biri şamil olunmur. Google Play hər tətbiq üçün MƏHZ o tətbiqi
// təsvir edən siyasət tələb edir; ümumi şirkət siyasətini göstərmək rədd
// səbəbidir.
//
// Məzmun tətbiqin KODUNDAN çıxarılıb, təxmin deyil:
//   • şəxsi məlumat toplanmır, hesab/qeydiyyat yoxdur;
//   • məşq statistikası və premium statusu yalnız cihazda (SharedPreferences);
//   • şəbəkəyə çıxan yeganə hissə Google Play Billing (abunəlik);
//   • reklam SDK-sı və analitika YOXDUR.

export const metadata = {
  title: "Nəfəs — Məxfilik siyasəti",
  description:
    "Nəfəs mobil tətbiqi hansı məlumatları toplayır (və toplamır), onlar harada saxlanılır.",
  alternates: { canonical: `${SITE_URL}/legal/nefes-privacy` },
};

export default function NefesPrivacyPage() {
  return (
    <LegalArticle title="Nəfəs — Məxfilik siyasəti" updated="12 Avqust 2026">
      <p>
        Bu siyasət <strong>Nəfəs</strong> (<code>az.kayzen.nefes</code>) mobil
        tətbiqinə aiddir. Tətbiqin operatoru {BRAND.legalName}-dir.
      </p>

      <LegalSection title="Qısa cavab">
        <p>
          Nəfəs sizdən heç bir şəxsi məlumat toplamır. Qeydiyyat, hesab yaratma və
          ya e-poçt tələb olunmur. Tətbiqdə reklam şəbəkəsi və analitika alətləri
          quraşdırılmayıb.
        </p>
      </LegalSection>

      <LegalSection title="Cihazda saxlanılan məlumatlar">
        <p>
          Aşağıdakılar <strong>yalnız sizin cihazınızda</strong> saxlanılır və
          bizim serverlərimizə göndərilmir: məşq statistikanız (günlük seriya,
          ümumi dəqiqə, sessiya sayı), premium abunəlik statusu, xatırlatma
          vaxtı və seçdiyiniz dil/səs parametrləri.
        </p>
        <p>
          Tətbiqi silsəniz bu məlumatlar da cihazdan silinir. Onları bərpa etmək
          bizim üçün mümkün deyil, çünki bizdə nüsxəsi yoxdur.
        </p>
      </LegalSection>

      <LegalSection title="Abunəlik və ödənişlər">
        <p>
          Abunəlik Google Play vasitəsilə həyata keçirilir. Ödəniş məlumatlarınızı
          (kart nömrəsi və s.) biz görmürük və saxlamırıq — onları Google emal
          edir. Tətbiq Google Play-dən yalnız abunəliyin aktiv olub-olmadığını
          öyrənir.
        </p>
        <p>
          Abunəliyi istənilən vaxt Google Play → Abunəliklər bölməsindən ləğv edə
          bilərsiniz.
        </p>
      </LegalSection>

      <LegalSection title="İcazələr">
        <p>
          Tətbiq yalnız iki icazə istəyir: <strong>bildiriş</strong> (yalnız siz
          gündəlik xatırlatmanı özünüz aktiv etsəniz) və{" "}
          <strong>vibrasiya</strong> (nəfəs mərhələlərini gözüyumulu izləmək
          üçün). Kamera, mikrofon, məkan, kontaktlar və yaddaş icazələri
          istənilmir.
        </p>
      </LegalSection>

      <LegalSection title="Uşaqlar">
        <p>
          Tətbiq uşaqlara yönəlmir və uşaqlardan bilərəkdən məlumat toplamır.
          Onsuz da heç bir istifadəçidən şəxsi məlumat toplanmır.
        </p>
      </LegalSection>

      <LegalSection title="Dəyişikliklər">
        <p>
          Siyasət yenilənərsə, bu səhifədəki tarix dəyişəcək. Məlumat toplama
          praktikasında əsaslı dəyişiklik olarsa, tətbiqin yenilənmə qeydlərində
          bildiriləcək.
        </p>
      </LegalSection>

      <LegalSection title="Əlaqə">
        <p>
          Suallar üçün: <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          <br />
          {BRAND.legalName}
        </p>
      </LegalSection>

      <LegalSection title="Tibbi xəbərdarlıq">
        <p>
          Nəfəs rahatlama və sağlam vərdişlərə dəstək üçün nəzərdə tutulub. Tibbi
          cihaz deyil, heç bir xəstəliyi diaqnoz etmir və müalicə etmir. Tənəffüs
          və ya ürək problemi olan şəxslər nəfəs məşqlərinə başlamazdan əvvəl
          həkimlə məsləhətləşməlidir.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
