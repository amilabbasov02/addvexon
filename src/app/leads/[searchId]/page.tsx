import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { leadSearches } from "@/db/schema";
import { getSession, getUserDefaultWorkspace } from "@/lib/session";
import { SearchResultsClient } from "./SearchResultsClient";

export const dynamic = "force-dynamic";

export default async function SearchResultsPage({
  params,
}: {
  params: Promise<{ searchId: string }>;
}) {
  const { searchId } = await params;

  const session = await getSession();
  if (!session?.user) redirect("/signin");

  const workspace = await getUserDefaultWorkspace(session.user.id);
  if (!workspace) notFound();

  const search = await db.query.leadSearches.findFirst({
    where: and(
      eq(leadSearches.id, searchId),
      eq(leadSearches.workspaceId, workspace.id),
    ),
  });
  if (!search) notFound();

  return <SearchResultsClient search={search} />;
}
