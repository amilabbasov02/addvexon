/**
 * Leads collection API.
 *   GET /api/leads → filtered, paged leads for the current workspace
 *
 * Filters mirror the ones offered in the results table so the UI never has to
 * fetch everything and narrow it client-side.
 */
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, ilike, inArray, isNotNull, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { leadAnalyses, leads, tenants } from "@/db/schema";
import { requireUser, getUserDefaultWorkspace } from "@/lib/session";

export const runtime = "nodejs";

const MAX_LIMIT = 200;

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const workspace = await getUserDefaultWorkspace(user.id);
    if (!workspace) return NextResponse.json({ leads: [], total: 0 });

    const p = new URL(req.url).searchParams;
    const limit = Math.min(
      Number.parseInt(p.get("limit") ?? "50", 10) || 50,
      MAX_LIMIT,
    );
    const offset = Math.max(Number.parseInt(p.get("offset") ?? "0", 10) || 0, 0);

    const filters: SQL[] = [eq(leads.workspaceId, workspace.id)];

    const searchId = p.get("searchId");
    if (searchId) filters.push(eq(leads.searchId, searchId));

    const band = p.get("band");
    if (band && ["high", "medium", "low"].includes(band)) {
      filters.push(eq(leads.band, band));
    }

    const category = p.get("category");
    if (category) filters.push(eq(leads.category, category));

    const status = p.get("status");
    if (status) {
      const values = status.split(",").map((s) => s.trim()).filter(Boolean);
      if (values.length > 0) filters.push(inArray(leads.status, values));
    }

    // "no website" and "has website" are the two filters that actually drive
    // the workflow, so they are first-class rather than a generic field filter.
    const website = p.get("website");
    if (website === "none") filters.push(isNull(leads.websiteUrl));
    if (website === "has") filters.push(isNotNull(leads.websiteUrl));

    if (p.get("hasContact") === "1") {
      filters.push(or(isNotNull(leads.phone), isNotNull(leads.email))!);
    }

    const minScore = Number.parseInt(p.get("minScore") ?? "", 10);
    if (!Number.isNaN(minScore)) filters.push(gte(leads.score, minScore));

    const maxScore = Number.parseInt(p.get("maxScore") ?? "", 10);
    if (!Number.isNaN(maxScore)) filters.push(lte(leads.score, maxScore));

    const q = p.get("q")?.trim();
    if (q) filters.push(ilike(leads.name, `%${q}%`));

    const where = and(...filters);

    const [rows, totals] = await Promise.all([
      db
        .select({
          id: leads.id,
          name: leads.name,
          category: leads.category,
          city: leads.city,
          address: leads.address,
          phone: leads.phone,
          email: leads.email,
          websiteUrl: leads.websiteUrl,
          socials: leads.socials,
          score: leads.score,
          band: leads.band,
          scoreReasons: leads.scoreReasons,
          status: leads.status,
          contactedAt: leads.contactedAt,
          sourceAttribution: leads.sourceAttribution,
          createdAt: leads.createdAt,
          reachable: leadAnalyses.reachable,
          issues: leadAnalyses.issues,
          demoSubdomain: tenants.subdomain,
        })
        .from(leads)
        .leftJoin(leadAnalyses, eq(leadAnalyses.leadId, leads.id))
        // At most one demo tenant per lead, so this cannot fan the result out.
        .leftJoin(
          tenants,
          and(eq(tenants.leadId, leads.id), eq(tenants.status, "demo")),
        )
        .where(where)
        .orderBy(desc(leads.score), desc(leads.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(leads)
        .where(where),
    ]);

    return NextResponse.json({
      leads: rows,
      total: totals[0]?.count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[leads] GET", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
