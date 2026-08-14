import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { leadSearches } from "@/db/schema";
import { getSession, getUserDefaultWorkspace } from "@/lib/session";
import { LeadFinderClient } from "./LeadFinderClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lead Finder — Addvoxen",
  description:
    "Find local businesses that need a website, score them, and turn them into customers.",
};

export default async function LeadsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/signin");

  const workspace = await getUserDefaultWorkspace(session.user.id);

  const searches = workspace
    ? await db
        .select()
        .from(leadSearches)
        .where(eq(leadSearches.workspaceId, workspace.id))
        .orderBy(desc(leadSearches.createdAt))
        .limit(20)
    : [];

  return <LeadFinderClient initialSearches={searches} />;
}
