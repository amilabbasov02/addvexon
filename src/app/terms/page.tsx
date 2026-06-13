import { LegalArticle, LegalSection } from "@/components/site/LegalArticle";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: "İstifadə şərtləri",
  description: "addvoxen hazır sayt və hosting xidmətinin istifadə şərtləri.",
};

export default function TermsPage() {
  return (
    <LegalArticle title="İstifadə şərtləri" updated="13 İyun 2026">
      <p>
        {BRAND.name} xidmətindən istifadə etməklə bu şərtləri qəbul etmiş olursunuz.
        Xidmət hazır sayt şablonlarının satışı və managed hosting-i əhatə edir.
      </p>

      <LegalSection title="Xidmətin təsviri">
        <p>
          Şablon seçirsiniz, ödəniş edirsiniz, sayt bizim tərəfimizdən aktivləşdirilir
          (hosted) və ya kod paketi sizə təhvil verilir (export). Hosted halda saytı
          öz panelinizdən idarə edirsiniz.
        </p>
      </LegalSection>

      <LegalSection title="Abunə və ödəniş">
        <p>
          Hosted model: bir dəfəlik giriş haqqı + aylıq abunə. Abunə dayandırılarsa,
          sayt qeyri-aktiv edilə bilər. Export model: bir dəfəlik ödəniş, aylıq haqq
          yoxdur. Cari qiymətlər sifariş zamanı təsdiqlənir.
        </p>
      </LegalSection>

      <LegalSection title="Məzmun və məsuliyyət">
        <p>
          Saytınızda yerləşdirdiyiniz məzmuna görə siz cavabdehsiniz. Qanunsuz,
          zərərli və ya hüquq pozan məzmun qadağandır. Belə hallarda xidməti
          dayandırmaq hüququmuz var.
        </p>
      </LegalSection>

      <LegalSection title="Təhlükəsizlik">
        <p>
          Müştəri panelində yalnız strukturlu inteqrasiya sahələri (GA4/GTM/Pixel)
          mövcuddur — özbaşına skript əlavə etmək mümkün deyil. Bu, bütün saytların
          təhlükəsizliyini qorumaq üçündür.
        </p>
      </LegalSection>

      <LegalSection title="Xidmətin dayandırılması">
        <p>
          İstənilən tərəf abunəni ləğv edə bilər. Ödənişlərin geri qaytarılması
          Geri qaytarma siyasətinə uyğun tənzimlənir.
        </p>
      </LegalSection>

      <LegalSection title="Əlaqə">
        <p>Suallar üçün: <a className="text-indigo-600 hover:underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
      </LegalSection>
    </LegalArticle>
  );
}
