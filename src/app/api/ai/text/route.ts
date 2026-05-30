/**
 * AI text generation — Anthropic Claude API.
 *   POST /api/ai/text
 *   Body: {
 *     kind: "headline" | "subhead" | "cta" | "body" | "variants",
 *     brief: string,           // user's prompt or context
 *     existing?: string,       // optional current text to rewrite
 *     count?: number,          // how many variants (default 5)
 *     tone?: string,           // e.g. "luxury", "playful", "bold"
 *   }
 *   Returns: { variants: string[] }
 *
 * Pro / Team only. Each call costs 1 AI credit (tracked in usage_metrics).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { eq, and, sql } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { users, usageMetrics, aiJobs } from "@/db/schema";
import { getLimits } from "@/lib/billing";
import { uid } from "@/lib/ids";

const BodySchema = z.object({
  kind: z.enum(["headline", "subhead", "cta", "body", "variants"]),
  brief: z.string().min(2).max(2000),
  existing: z.string().max(2000).optional(),
  count: z.number().int().min(1).max(10).default(5),
  tone: z.string().max(80).optional(),
});

const PROMPTS: Record<string, (b: z.infer<typeof BodySchema>) => string> = {
  headline: (b) =>
    `Generate ${b.count} short, high-conversion ad-banner headlines (max 8 words each) for: ${b.brief}.${
      b.tone ? ` Tone: ${b.tone}.` : ""
    }${b.existing ? ` Current version: "${b.existing}".` : ""} Return ONLY the headlines, one per line, no numbering, no quotes, no extra text.`,
  subhead: (b) =>
    `Generate ${b.count} concise sub-headlines (max 15 words) that support this campaign: ${b.brief}.${
      b.tone ? ` Tone: ${b.tone}.` : ""
    } Return ONLY the sub-headlines, one per line.`,
  cta: (b) =>
    `Generate ${b.count} short call-to-action button labels (1-3 words) for: ${b.brief}.${
      b.tone ? ` Tone: ${b.tone}.` : ""
    } Examples: "Get Started", "Try Free", "Shop Now". Return ONLY the CTAs, one per line.`,
  body: (b) =>
    `Generate ${b.count} short body-copy paragraphs (max 30 words each) for: ${b.brief}.${
      b.tone ? ` Tone: ${b.tone}.` : ""
    } Return ONLY the paragraphs, one per line, separated by blank lines.`,
  variants: (b) =>
    `Generate ${b.count} creative variations of this ad copy: "${b.existing ?? b.brief}". Keep the same intent but vary tone, structure and wording. Return ONLY the variations, one per line.`,
};

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI is not configured (ANTHROPIC_API_KEY missing)." },
        { status: 503 },
      );
    }

    const limits = getLimits(user.plan);
    if (!limits.canUseAiText) {
      return NextResponse.json(
        { error: "Upgrade to Pro to use AI text generation." },
        { status: 402 },
      );
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Check AI credit balance for this month
    const period = new Date().toISOString().slice(0, 7);
    const usage = await db
      .select({ ai: usageMetrics.aiCreditsUsed })
      .from(usageMetrics)
      .where(and(eq(usageMetrics.userId, user.id), eq(usageMetrics.period, period)))
      .limit(1);
    const used = usage[0]?.ai ?? 0;
    if (used >= limits.aiCreditsPerMonth) {
      return NextResponse.json(
        {
          error: `AI credit limit reached (${limits.aiCreditsPerMonth} / month). Upgrade for more.`,
        },
        { status: 402 },
      );
    }

    const prompt = PROMPTS[parsed.data.kind](parsed.data);
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const start = Date.now();
    const resp = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      resp.content
        .filter((c) => c.type === "text")
        .map((c) => (c.type === "text" ? c.text : ""))
        .join("\n")
        .trim() ?? "";

    const variants = text
      .split(/\n+/)
      .map((line) => line.replace(/^\s*[-•*\d.)\]]+\s*/, "").replace(/^["']|["']$/g, "").trim())
      .filter(Boolean)
      .slice(0, parsed.data.count);

    // Increment usage + log job
    if (usage.length === 0) {
      await db.insert(usageMetrics).values({
        id: uid("um"),
        userId: user.id,
        period,
        aiCreditsUsed: 1,
        exportsCount: 0,
        storageBytes: 0,
      });
    } else {
      await db
        .update(usageMetrics)
        .set({
          aiCreditsUsed: sql`${usageMetrics.aiCreditsUsed} + 1`,
          updatedAt: new Date(),
        })
        .where(and(eq(usageMetrics.userId, user.id), eq(usageMetrics.period, period)));
    }

    await db.insert(aiJobs).values({
      id: uid("aij"),
      userId: user.id,
      type: "text_gen",
      prompt: parsed.data.brief,
      result: { variants, kind: parsed.data.kind },
      status: "done",
      tokensUsed: (resp.usage?.input_tokens ?? 0) + (resp.usage?.output_tokens ?? 0),
      costCents: 0,
    });

    return NextResponse.json({
      variants,
      kind: parsed.data.kind,
      tookMs: Date.now() - start,
      creditsRemaining: Math.max(0, limits.aiCreditsPerMonth - used - 1),
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("AI text error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 500 },
    );
  }
}
