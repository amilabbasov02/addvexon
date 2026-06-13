import { LegalArticle, LegalSection } from "@/components/site/LegalArticle";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: "Məxfilik siyasəti",
  description: "addvoxen şəxsi məlumatları necə toplayır, istifadə edir və qoruyur.",
};

export default function PrivacyPage() {
  return (
    <LegalArticle title="Məxfilik siyasəti" updated="13 İyun 2026">
      <p>
        {BRAND.name} ({BRAND.domain}) hazır sayt şablonları satışı və managed hosting
        xidməti göstərir. Bu siyasət xidmətdən istifadə zamanı məlumatların necə
        toplandığını və qorunduğunu izah edir.
      </p>

      <LegalSection title="Hansı məlumatları toplayırıq">
        <p>
          Hesab məlumatları (ad, e-poçt), sifariş və ödəniş məlumatları, saytınızın
          məzmunu və domen parametrləri. Həmçinin xidmətin yaxşılaşdırılması üçün
          anonim istifadə statistikası.
        </p>
      </LegalSection>

      <LegalSection title="Məlumatlardan necə istifadə edirik">
        <p>
          Xidmətin göstərilməsi, saytınızın host edilməsi, dəstək və qanuni
          öhdəliklərin yerinə yetirilməsi üçün. Məlumatlarınızı üçüncü tərəflərə
          satmırıq.
        </p>
      </LegalSection>

      <LegalSection title="Tenant (müştəri saytı) məlumatları">
        <p>
          Saytınızın məzmunu yalnız sizə aiddir. Hosting halında məlumat bizim
          serverlərimizdə (Vercel/Neon) saxlanılır və izolə olunur. Export halında
          tam məlumat sizə təhvil verilir.
        </p>
      </LegalSection>

      <LegalSection title="Analitika və inteqrasiyalar">
        <p>
          Saytınıza GA4, Google Tag Manager və Meta Pixel kimi inteqrasiyaları
          strukturlu sahələr vasitəsilə əlavə edə bilərsiniz. Bu xidmətlərin öz
          məxfilik siyasətləri tətbiq olunur.
        </p>
      </LegalSection>

      <LegalSection title="Hüquqlarınız">
        <p>
          Məlumatlarınıza giriş, düzəliş və silinmə tələb edə bilərsiniz. Müraciət
          üçün: {BRAND.email}.
        </p>
      </LegalSection>

      <LegalSection title="Əlaqə">
        <p>Suallar üçün: <a className="text-indigo-600 hover:underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
      </LegalSection>
    </LegalArticle>
  );
}
