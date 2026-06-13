import { LegalArticle, LegalSection } from "@/components/site/LegalArticle";
import { BRAND } from "@/lib/brand";

import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Geri qaytarma siyasəti",
  description: "addvoxen abunə və export ödənişləri üçün geri qaytarma şərtləri.",
  alternates: { canonical: `${SITE_URL}/refund` },
};

export default function RefundPage() {
  return (
    <LegalArticle title="Geri qaytarma siyasəti" updated="13 İyun 2026">
      <p>
        Müştəri məmnunluğu bizim üçün vacibdir. Aşağıda abunə (hosted) və export
        modelləri üçün geri qaytarma şərtləri verilib.
      </p>

      <LegalSection title="Abunə (hosted)">
        <p>
          Saytınız aktivləşdirilməzdən əvvəl ödənişin tam geri qaytarılması
          mümkündür. Aktivləşmədən sonra giriş haqqı qeyri-bərpa olunandır, çünki
          quraşdırma və konfiqurasiya işi görülür. Aylıq abunəni istənilən vaxt
          dayandıra bilərsiniz — növbəti dövr üçün ödəniş alınmır.
        </p>
      </LegalSection>

      <LegalSection title="Export (self-host)">
        <p>
          Export paketi (kod + SQL + sənədlər) təhvil verildikdən sonra məhsulun
          rəqəmsal təbiətinə görə geri qaytarma mümkün deyil. Təhvildən əvvəl ləğv
          edilərsə, tam geri qaytarılır.
        </p>
      </LegalSection>

      <LegalSection title="Necə müraciət etmək olar">
        <p>
          Geri qaytarma tələbi üçün ödənişdən sonra 7 gün ərzində {BRAND.email}
          ünvanına yazın. Müraciətiniz 3 iş günü ərzində nəzərdən keçirilir.
        </p>
      </LegalSection>

      <LegalSection title="Əlaqə">
        <p>Suallar üçün: <a className="text-indigo-600 hover:underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
      </LegalSection>
    </LegalArticle>
  );
}
