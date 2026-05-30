import { getSession } from "@/lib/session";
import { PricingClient } from "./PricingClient";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const session = await getSession();
  return (
    <PricingClient
      signedIn={!!session?.user}
      currentPlan={(session?.user as { plan?: string } | undefined)?.plan ?? "free"}
      userEmail={session?.user?.email}
    />
  );
}
