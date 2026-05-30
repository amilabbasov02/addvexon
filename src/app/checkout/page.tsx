import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { CheckoutClient } from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; billing?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  if (!session?.user) {
    const next = `/checkout?plan=${params.plan ?? "pro"}&billing=${params.billing ?? "monthly"}`;
    redirect(`/signin?next=${encodeURIComponent(next)}`);
  }
  return (
    <CheckoutClient
      plan={(params.plan as "pro" | "team" | "enterprise") ?? "pro"}
      billing={(params.billing as "monthly" | "yearly") ?? "monthly"}
      userEmail={session.user.email}
    />
  );
}
