import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { paymentIntents, users } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { PaymentsAdminClient } from "./PaymentsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const rows = await db
    .select({
      id: paymentIntents.id,
      reference: paymentIntents.reference,
      plan: paymentIntents.plan,
      billing: paymentIntents.billing,
      amountCents: paymentIntents.amountCents,
      currency: paymentIntents.currency,
      country: paymentIntents.country,
      provider: paymentIntents.provider,
      status: paymentIntents.status,
      paidAt: paymentIntents.paidAt,
      createdAt: paymentIntents.createdAt,
      userId: paymentIntents.userId,
      userEmail: users.email,
      userName: users.name,
    })
    .from(paymentIntents)
    .leftJoin(users, eq(users.id, paymentIntents.userId))
    .orderBy(
      sql`CASE WHEN ${paymentIntents.status} = 'pending' THEN 0 ELSE 1 END`,
      desc(paymentIntents.createdAt),
    )
    .limit(200);
  return (
    <PaymentsAdminClient
      rows={rows.map((r) => ({
        ...r,
        paidAt: r.paidAt instanceof Date ? r.paidAt.toISOString() : r.paidAt,
        createdAt:
          r.createdAt instanceof Date
            ? r.createdAt.toISOString()
            : r.createdAt,
      }))}
    />
  );
}
