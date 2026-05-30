import { desc } from "drizzle-orm";
import { db } from "@/db";
import { waitlist } from "@/db/schema";
import { WaitlistAdminClient } from "./WaitlistAdminClient";

export const dynamic = "force-dynamic";

export type WaitlistEntry = typeof waitlist.$inferSelect;

export default async function AdminWaitlistPage() {
  const rows = await db
    .select()
    .from(waitlist)
    .orderBy(desc(waitlist.createdAt))
    .limit(500);
  return <WaitlistAdminClient entries={rows} />;
}
