/**
 * Müştəri panel API-si — tenant məzmununu, temasını, inteqrasiyalarını və
 * domenini saxlayır. Yalnız tenant SAHİBİ dəyişə bilər (ownership yoxlanır).
 * TƏHLÜKƏSİZLİK: yalnız strukturlu inteqrasiya sahələri qəbul olunur (raw
 * skript yox).
 */
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants, tenantContent, tenantIntegrations } from "@/db/schema";
import { getSession } from "@/lib/session";

function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t.slice(0, 200) : null;
}
/** İnteqrasiya ID-ləri — yalnız təhlükəsiz simvollar. */
function cleanId(v: unknown): string | null {
  const c = clean(v);
  if (!c) return null;
  const id = c.replace(/[^A-Za-z0-9_-]/g, "");
  return id.length ? id.slice(0, 40) : null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Sahiblik yoxlaması
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, id), eq(tenants.ownerId, session.user.id)))
    .limit(1);
  if (!tenant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const now = new Date();

  // 1) Tenant adı + custom domen
  const name = clean(b.name) ?? tenant.name;
  const customDomainRaw = clean(b.customDomain);
  const customDomain = customDomainRaw
    ? customDomainRaw.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    : null;
  const domainChanged = customDomain !== (tenant.customDomain ?? null);
  await db
    .update(tenants)
    .set({
      name,
      customDomain,
      domainStatus: customDomain ? (domainChanged ? "pending" : tenant.domainStatus) : "none",
      updatedAt: now,
    })
    .where(eq(tenants.id, id));

  // 2) Məzmun + tema (tam obyekt panel tərəfindən göndərilir)
  if (b.content && b.theme) {
    const existing = await db
      .select({ tenantId: tenantContent.tenantId })
      .from(tenantContent)
      .where(eq(tenantContent.tenantId, id))
      .limit(1);
    if (existing.length) {
      await db
        .update(tenantContent)
        .set({ content: b.content as Record<string, unknown>, theme: b.theme as object, updatedAt: now })
        .where(eq(tenantContent.tenantId, id));
    } else {
      await db.insert(tenantContent).values({
        tenantId: id,
        content: b.content as Record<string, unknown>,
        theme: b.theme as object,
      });
    }
  }

  // 3) İnteqrasiyalar (yalnız strukturlu ID-lər)
  const ig = (b.integrations ?? {}) as Record<string, unknown>;
  const igValues = {
    ga4Id: cleanId(ig.ga4Id),
    gtmContainerId: cleanId(ig.gtmContainerId),
    metaPixelId: cleanId(ig.metaPixelId),
    googleVerification: cleanId(ig.googleVerification),
    metaVerification: cleanId(ig.metaVerification),
    updatedAt: now,
  };
  const existingIg = await db
    .select({ tenantId: tenantIntegrations.tenantId })
    .from(tenantIntegrations)
    .where(eq(tenantIntegrations.tenantId, id))
    .limit(1);
  if (existingIg.length) {
    await db.update(tenantIntegrations).set(igValues).where(eq(tenantIntegrations.tenantId, id));
  } else {
    await db.insert(tenantIntegrations).values({ tenantId: id, ...igValues });
  }

  return NextResponse.json({ ok: true });
}
