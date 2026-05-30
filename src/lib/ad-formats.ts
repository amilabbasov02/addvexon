/**
 * Standard ad / banner / social formats. Single source of truth used by:
 *   - the template-seeding script (one starter template per size)
 *   - the editor's canvas-size picker
 *   - the Export Dialog ("Meta Pack", "Google Ads Pack", etc)
 *   - the Magic Resize feature (one design → N sizes)
 *
 * Sizes are in pixels (display) — print formats are at 72 dpi for parity
 * with web canvases, with print-resolution upscaling handled at export time.
 */
export type AdPlatform =
  | "meta"
  | "google"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "twitter"
  | "pinterest"
  | "snapchat"
  | "print"
  | "universal";

export type AdOrientation = "square" | "portrait" | "landscape";

export type AdFormat = {
  /** kebab-case, stable across releases — used as template slug suffix */
  id: string;
  name: string;
  platform: AdPlatform;
  /** Where this format is shown / what placement it targets */
  placement: string;
  width: number;
  height: number;
  orientation: AdOrientation;
  /** Visible in the Export Dialog's grouped packs */
  pack: string;
};

function orient(w: number, h: number): AdOrientation {
  if (w === h) return "square";
  return w > h ? "landscape" : "portrait";
}

const make = (
  id: string,
  name: string,
  platform: AdPlatform,
  placement: string,
  width: number,
  height: number,
  pack: string,
): AdFormat => ({
  id,
  name,
  platform,
  placement,
  width,
  height,
  orientation: orient(width, height),
  pack,
});

// ============================================================
//  META (Facebook + Instagram)
// ============================================================
const META: AdFormat[] = [
  make("meta-feed-square", "Feed Square", "meta", "Facebook & Instagram feed", 1080, 1080, "meta-pack"),
  make("meta-feed-portrait", "Feed Portrait", "meta", "Instagram feed", 1080, 1350, "meta-pack"),
  make("meta-feed-landscape", "Feed Landscape", "meta", "Facebook feed", 1200, 630, "meta-pack"),
  make("meta-story", "Story / Reel", "meta", "Stories & Reels", 1080, 1920, "meta-pack"),
  make("meta-carousel", "Carousel Card", "meta", "Carousel feed", 1080, 1080, "meta-pack"),
  make("meta-marketplace", "Marketplace", "meta", "Facebook Marketplace", 1200, 1200, "meta-pack"),
  make("meta-cover", "Facebook Page Cover", "meta", "Page cover photo", 1200, 675, "meta-pack"),
];

// ============================================================
//  GOOGLE ADS (IAB display sizes — most common)
// ============================================================
const GOOGLE: AdFormat[] = [
  make("google-medium-rectangle", "Medium Rectangle", "google", "Display Network", 300, 250, "google-pack"),
  make("google-leaderboard", "Leaderboard", "google", "Display top placement", 728, 90, "google-pack"),
  make("google-large-rectangle", "Large Rectangle", "google", "Display in-article", 336, 280, "google-pack"),
  make("google-wide-skyscraper", "Wide Skyscraper", "google", "Display sidebar", 160, 600, "google-pack"),
  make("google-half-page", "Half Page", "google", "Display sidebar / mobile", 300, 600, "google-pack"),
  make("google-mobile-banner", "Mobile Banner", "google", "Mobile display", 320, 50, "google-pack"),
  make("google-large-mobile-banner", "Large Mobile Banner", "google", "Mobile display", 320, 100, "google-pack"),
  make("google-billboard", "Billboard", "google", "High-impact display", 970, 250, "google-pack"),
  make("google-large-leaderboard", "Large Leaderboard", "google", "Wide display", 970, 90, "google-pack"),
  make("google-square", "Square", "google", "Display square", 250, 250, "google-pack"),
  make("google-small-square", "Small Square", "google", "Display square", 200, 200, "google-pack"),
];

// ============================================================
//  TIKTOK
// ============================================================
const TIKTOK: AdFormat[] = [
  make("tiktok-feed", "In-Feed Ad", "tiktok", "For You Page feed", 1080, 1920, "tiktok-pack"),
  make("tiktok-topview", "TopView", "tiktok", "Open-app placement", 1080, 1920, "tiktok-pack"),
  make("tiktok-spark", "Spark Ad Cover", "tiktok", "Spark ad creative", 1080, 1920, "tiktok-pack"),
  make("tiktok-collection", "Collection Card", "tiktok", "Collection ad", 1080, 1080, "tiktok-pack"),
];

// ============================================================
//  YOUTUBE
// ============================================================
const YOUTUBE: AdFormat[] = [
  make("yt-thumbnail", "Video Thumbnail", "youtube", "Video listing", 1280, 720, "youtube-pack"),
  make("yt-channel-art", "Channel Cover", "youtube", "Channel art", 2560, 1440, "youtube-pack"),
  make("yt-bumper", "Bumper Frame", "youtube", "6s bumper cover", 1920, 1080, "youtube-pack"),
];

// ============================================================
//  LINKEDIN
// ============================================================
const LINKEDIN: AdFormat[] = [
  make("li-feed", "Feed Post", "linkedin", "Single image ad", 1200, 627, "linkedin-pack"),
  make("li-square", "Feed Square", "linkedin", "Sponsored content", 1200, 1200, "linkedin-pack"),
  make("li-cover", "Page Cover", "linkedin", "Company page cover", 1584, 396, "linkedin-pack"),
];

// ============================================================
//  X / TWITTER
// ============================================================
const TWITTER: AdFormat[] = [
  make("x-post", "Image Post", "twitter", "Promoted tweet", 1200, 675, "twitter-pack"),
  make("x-header", "Profile Header", "twitter", "Profile cover", 1500, 500, "twitter-pack"),
];

// ============================================================
//  PINTEREST
// ============================================================
const PINTEREST: AdFormat[] = [
  make("pin-standard", "Standard Pin", "pinterest", "Home feed pin", 1000, 1500, "pinterest-pack"),
  make("pin-square", "Square Pin", "pinterest", "Square placement", 1080, 1080, "pinterest-pack"),
];

// ============================================================
//  SNAPCHAT
// ============================================================
const SNAPCHAT: AdFormat[] = [
  make("snap-ad", "Snap Ad", "snapchat", "Between stories", 1080, 1920, "snapchat-pack"),
];

// ============================================================
//  PRINT / DOCUMENT (PDF export)
// ============================================================
const PRINT: AdFormat[] = [
  // A-series at 72 dpi (1mm ≈ 2.835pt)
  make("print-a4-portrait", "A4 Portrait", "print", "A4 print", 595, 842, "print-pack"),
  make("print-a4-landscape", "A4 Landscape", "print", "A4 print", 842, 595, "print-pack"),
  make("print-a5", "A5 Flyer", "print", "A5 flyer", 420, 595, "print-pack"),
  make("print-letter", "US Letter", "print", "US Letter print", 612, 792, "print-pack"),
  make("print-postcard", "Postcard 5×7", "print", "Postcard", 360, 504, "print-pack"),
  make("print-businesscard", "Business Card", "print", "Business card 3.5×2", 252, 144, "print-pack"),
];

export const AD_FORMATS: AdFormat[] = [
  ...META,
  ...GOOGLE,
  ...TIKTOK,
  ...YOUTUBE,
  ...LINKEDIN,
  ...TWITTER,
  ...PINTEREST,
  ...SNAPCHAT,
  ...PRINT,
];

export const FORMATS_BY_ID: Map<string, AdFormat> = new Map(
  AD_FORMATS.map((f) => [f.id, f]),
);

export type Pack = {
  id: string;
  label: string;
  description: string;
  icon: string;
  platforms: AdPlatform[];
  formats: AdFormat[];
};

export const EXPORT_PACKS: Pack[] = [
  {
    id: "meta-pack",
    label: "Meta (Facebook + Instagram)",
    description: "Feed, Stories, Reels, Carousel, Cover",
    icon: "share",
    platforms: ["meta"],
    formats: META,
  },
  {
    id: "google-pack",
    label: "Google Ads Display",
    description: "All major IAB sizes — Display Network ready",
    icon: "ads_click",
    platforms: ["google"],
    formats: GOOGLE,
  },
  {
    id: "tiktok-pack",
    label: "TikTok",
    description: "In-Feed, TopView, Spark, Collection",
    icon: "movie",
    platforms: ["tiktok"],
    formats: TIKTOK,
  },
  {
    id: "youtube-pack",
    label: "YouTube",
    description: "Thumbnails, Channel Cover, Bumper",
    icon: "smart_display",
    platforms: ["youtube"],
    formats: YOUTUBE,
  },
  {
    id: "linkedin-pack",
    label: "LinkedIn",
    description: "Feed, Square, Page Cover",
    icon: "work",
    platforms: ["linkedin"],
    formats: LINKEDIN,
  },
  {
    id: "twitter-pack",
    label: "X / Twitter",
    description: "Image post, profile header",
    icon: "tag",
    platforms: ["twitter"],
    formats: TWITTER,
  },
  {
    id: "pinterest-pack",
    label: "Pinterest",
    description: "Standard + Square pin",
    icon: "push_pin",
    platforms: ["pinterest"],
    formats: PINTEREST,
  },
  {
    id: "snapchat-pack",
    label: "Snapchat",
    description: "Snap Ad vertical",
    icon: "photo_camera",
    platforms: ["snapchat"],
    formats: SNAPCHAT,
  },
  {
    id: "print-pack",
    label: "Print / PDF",
    description: "A4, A5, Letter, Postcard, Business Card",
    icon: "print",
    platforms: ["print"],
    formats: PRINT,
  },
];

export function findFormatBySize(width: number, height: number): AdFormat | undefined {
  return AD_FORMATS.find((f) => f.width === width && f.height === height);
}
