import { CampaignsLanding } from "./CampaignsLanding";

export const dynamic = "force-dynamic";

/**
 * Campaigns are on the roadmap — until the Business Manager + bidding rails
 * are live we show a high-fidelity preview of what's coming so users
 * understand the surface exists.
 */
export default function CampaignsPage() {
  return <CampaignsLanding />;
}
