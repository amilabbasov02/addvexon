/**
 * Mərkəzi brend konfiqurasiyası. Logo, ad və əsas mesajlar BİR yerdən
 * idarə olunur — sonra real logo/favicon gələndə yalnız buranı dəyiş.
 *
 * Logo PLACEHOLDER-dir: hazırda mətn (wordmark) + sadə işarə. Real logo
 * faylı hazır olanda `logoSrc`-ı doldur; `Logo` komponenti avtomatik şəkilə
 * keçir.
 */
export const BRAND = {
  name: "addvoxen",
  /** Hüquqi şəxsin adı — saytı işlədən şirkət.
   *
   *  Altbilgidə GÖRÜNMƏLİDİR: Google Play təşkilat hesabının doğrulanmasında
   *  saytın hansı hüquqi şəxsə aid olduğu yoxlanılır. Brend adı (addvoxen)
   *  ilə şirkət adı fərqlidir, ona görə əlaqə saytda açıq yazılmalıdır. */
  legalName: "Novacode MMC",
  /** Böyük başlıqlarda istifadə üçün. */
  displayName: "addvoxen",
  tagline: "Hazır saytlar, dəqiqələr içində canlı.",
  description:
    "Hazır sayt şablonu seç, ödə, biz host edək. Öz domenini qoş, panellə idarə et — kod yazmadan.",
  /** Real logo gələndə bura SVG/PNG yolu yaz (məs. "/logo.svg"). Boşdursa
   *  wordmark + işarə placeholder göstərilir. */
  logoSrc: "" as string,
  /** Placeholder işarə rəngi (brend vurğusu). */
  markColor: "#6366f1",
  /** Əlaqə e-poçtu — mərkəzi. Dəyişmək üçün yalnız bu sətri redaktə et. */
  email: "support@addvoxen.com",
  domain: "addvoxen.com",
} as const;
