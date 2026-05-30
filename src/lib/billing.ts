/**
 * Plan definitions + feature gates. Single source of truth referenced by
 * the editor, dashboard, marketplace and API routes.
 */
export type Plan = "free" | "pro" | "team" | "enterprise";

export const PLAN_LIMITS: Record<
  Plan,
  {
    label: string;
    priceMonthly: number; // cents
    priceYearly: number; // cents
    maxDocs: number; // -1 = unlimited
    aiCreditsPerMonth: number;
    storageBytes: number;
    canExportWithoutWatermark: boolean;
    canAccessProTemplates: boolean;
    canUseAiText: boolean;
    canUseAiImage: boolean;
    canUploadImages: boolean;
    maxCanvasSizesPerResize: number; // Magic Resize
    canUseAnimation: boolean;
    canAccessMarketplace: boolean;
    canSellTemplates: boolean;
    teamSeats: number;
  }
> = {
  free: {
    label: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    maxDocs: 5,
    aiCreditsPerMonth: 0,
    storageBytes: 50 * 1024 * 1024, // 50 MB
    canExportWithoutWatermark: false,
    canAccessProTemplates: false,
    canUseAiText: false,
    canUseAiImage: false,
    canUploadImages: true,
    maxCanvasSizesPerResize: 3,
    canUseAnimation: false,
    canAccessMarketplace: true,
    canSellTemplates: false,
    teamSeats: 1,
  },
  pro: {
    label: "Pro",
    priceMonthly: 1200, // $12.00
    priceYearly: 11500, // $115/yr (~20% off)
    maxDocs: -1,
    aiCreditsPerMonth: 100,
    storageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    canExportWithoutWatermark: true,
    canAccessProTemplates: true,
    canUseAiText: true,
    canUseAiImage: true,
    canUploadImages: true,
    maxCanvasSizesPerResize: 30,
    canUseAnimation: true,
    canAccessMarketplace: true,
    canSellTemplates: true,
    teamSeats: 1,
  },
  team: {
    label: "Team",
    priceMonthly: 2500, // $25 per seat
    priceYearly: 24000, // $240 per seat / yr
    maxDocs: -1,
    aiCreditsPerMonth: 500,
    storageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    canExportWithoutWatermark: true,
    canAccessProTemplates: true,
    canUseAiText: true,
    canUseAiImage: true,
    canUploadImages: true,
    maxCanvasSizesPerResize: 30,
    canUseAnimation: true,
    canAccessMarketplace: true,
    canSellTemplates: true,
    teamSeats: 3,
  },
  enterprise: {
    label: "Enterprise",
    priceMonthly: 9900, // $99 base
    priceYearly: 99900,
    maxDocs: -1,
    aiCreditsPerMonth: 5000,
    storageBytes: 1024 * 1024 * 1024 * 1024, // 1 TB
    canExportWithoutWatermark: true,
    canAccessProTemplates: true,
    canUseAiText: true,
    canUseAiImage: true,
    canUploadImages: true,
    maxCanvasSizesPerResize: 30,
    canUseAnimation: true,
    canAccessMarketplace: true,
    canSellTemplates: true,
    teamSeats: 25,
  },
};

export function getLimits(plan: string) {
  return PLAN_LIMITS[(plan as Plan) in PLAN_LIMITS ? (plan as Plan) : "free"];
}

export function formatPrice(cents: number, currency = "USD"): string {
  if (cents === 0) return "Free";
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: dollars % 1 === 0 ? 0 : 2,
  }).format(dollars);
}
