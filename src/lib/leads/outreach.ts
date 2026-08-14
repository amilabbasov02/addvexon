/**
 * Outreach message generation.
 *
 * Copy is produced from templates by default, not from a language model. That
 * is a deliberate choice: templates are deterministic, free, reviewable before
 * anything is sent, and — most importantly — cannot invent a fact about
 * someone's business. AI rewriting is available behind a flag for when the
 * sender wants more variety, and it is constrained to rephrasing facts we
 * already hold.
 *
 * The messages themselves follow one rule: say what we actually observed, show
 * the work, and make leaving easy. A message that opens by naming a real
 * problem and links to a real demo is not spam; a generic blast is, regardless
 * of how it is worded.
 */
import type { Lead } from "@/db/schema";
import { CATEGORY_LABELS, type LeadCategory } from "./providers/types";

export type OutreachLocale = "az" | "en";

export type OutreachVariant = {
  variant: number;
  /** Short description of the angle, shown in the UI picker. */
  label: string;
  subject: string;
  body: string;
};

export type BuildOutreachInput = {
  lead: Lead;
  /** Link to the generated demo, if there is one. */
  demoUrl?: string | null;
  locale: OutreachLocale;
  senderName: string;
  /** Required — every message must carry a working opt-out. */
  unsubscribeUrl: string;
  /** True when the analysis found the site missing or broken. */
  noWebsite: boolean;
  /** Problems the analyser reported, already in plain language. */
  websiteIssues: string[];
};

export function buildOutreachVariants(
  input: BuildOutreachInput,
): OutreachVariant[] {
  const t = input.locale === "en" ? EN : AZ;
  const name = input.lead.name;
  const category =
    CATEGORY_LABELS[input.lead.category as LeadCategory] ??
    input.lead.category ??
    "";

  const variants: OutreachVariant[] = [
    {
      variant: 1,
      label: t.labels.demoFirst,
      subject: t.subjects.demoFirst(name),
      body: t.bodies.demoFirst({ name, category, ...input }),
    },
    {
      variant: 2,
      label: t.labels.observation,
      subject: t.subjects.observation(name),
      body: t.bodies.observation({ name, category, ...input }),
    },
    {
      variant: 3,
      label: t.labels.short,
      subject: t.subjects.short(name),
      body: t.bodies.short({ name, category, ...input }),
    },
  ];

  return variants.map((v) => ({
    ...v,
    body: `${v.body.trim()}\n\n${t.signature(input.senderName)}\n\n${t.unsubscribe(input.unsubscribeUrl)}`,
  }));
}

type BodyInput = BuildOutreachInput & { name: string; category: string };

// ── Azerbaijani ─────────────────────────────────────────────────────────────

const AZ = {
  labels: {
    demoFirst: "Demo ilə başlayan",
    observation: "Müşahidə ilə başlayan",
    short: "Qısa",
  },
  subjects: {
    demoFirst: (name: string) => `${name} üçün hazırladığımız sayt nümunəsi`,
    observation: (name: string) => `${name} — onlayn görünürlük barədə`,
    short: (name: string) => `${name} üçün qısa bir təklif`,
  },
  bodies: {
    demoFirst: (i: BodyInput) => `Salam,

${i.name} üçün qısa bir sayt nümunəsi hazırladıq — heç bir öhdəlik yoxdur, sadəcə necə görünə biləcəyini göstərmək istədik.

${i.demoUrl ? `Buradan baxa bilərsiniz: ${i.demoUrl}` : "İstəsəniz, nümunəni sizə göndərə bilərik."}

${observationLine(i, "az")}

Bəyənsəniz, məzmunu sizin üçün uyğunlaşdırıb bir neçə günə işlək vəziyyətə gətirə bilərik. Bəyənməsəniz, bu mesajı nəzərə almaya bilərsiniz.`,

    observation: (i: BodyInput) => `Salam,

Bakıda ${i.category.toLowerCase()} sahəsindəki bizneslərə baxarkən ${i.name} diqqətimizi çəkdi.

${observationLine(i, "az")}

${i.demoUrl ? `Ona görə sizin üçün qısa bir nümunə hazırladıq: ${i.demoUrl}` : "İstəsəniz, sizin üçün qısa bir nümunə hazırlaya bilərik."}

Maraqlanırsınızsa, bir cümlə ilə cavab yazmağınız kifayətdir.`,

    short: (i: BodyInput) => `Salam,

${i.name} üçün bir sayt nümunəsi hazırladıq.${i.demoUrl ? ` Baxmaq üçün: ${i.demoUrl}` : ""}

${observationLine(i, "az")}

Maraqlıdırsa, yazın — detalları danışaq.`,
  },
  signature: (sender: string) => `Hörmətlə,\n${sender}\nAddvoxen`,
  unsubscribe: (url: string) =>
    `Bu mesajları almaq istəmirsinizsə, buradan imtina edə bilərsiniz: ${url}`,
};

// ── English ─────────────────────────────────────────────────────────────────

const EN = {
  labels: {
    demoFirst: "Demo first",
    observation: "Observation first",
    short: "Short",
  },
  subjects: {
    demoFirst: (name: string) => `A website mock-up we made for ${name}`,
    observation: (name: string) => `${name} — a note about your online presence`,
    short: (name: string) => `Quick idea for ${name}`,
  },
  bodies: {
    demoFirst: (i: BodyInput) => `Hello,

We put together a short website mock-up for ${i.name} — no obligation, we just wanted to show what it could look like.

${i.demoUrl ? `You can see it here: ${i.demoUrl}` : "We're happy to send it over if you'd like a look."}

${observationLine(i, "en")}

If you like it, we can adapt the content for you and have it live within a few days. If not, feel free to ignore this message.`,

    observation: (i: BodyInput) => `Hello,

While looking at ${i.category.toLowerCase()} businesses in your area, ${i.name} stood out to us.

${observationLine(i, "en")}

${i.demoUrl ? `So we built a short mock-up for you: ${i.demoUrl}` : "We'd be glad to put a short mock-up together for you."}

If it's of interest, a one-line reply is all it takes.`,

    short: (i: BodyInput) => `Hello,

We made a website mock-up for ${i.name}.${i.demoUrl ? ` Here it is: ${i.demoUrl}` : ""}

${observationLine(i, "en")}

If it's useful, just reply and we'll take it from there.`,
  },
  signature: (sender: string) => `Best regards,\n${sender}\nAddvoxen`,
  unsubscribe: (url: string) =>
    `If you'd rather not hear from us, you can opt out here: ${url}`,
};

/**
 * The one sentence that makes the message specific.
 *
 * It states only what the analyser actually found. If we found nothing worth
 * mentioning, it says nothing rather than inventing a problem — a fabricated
 * criticism of someone's website is the fastest way to lose the reply.
 */
function observationLine(i: BodyInput, locale: OutreachLocale): string {
  if (locale === "az") {
    if (i.noWebsite) {
      return "Axtarışlarımızda ${x} üçün veb sayt tapa bilmədik — müştəriləriniz sizi onlayn axtaranda bu, itirilmiş imkandır.".replace(
        "${x}",
        i.name,
      );
    }
    if (i.websiteIssues.length > 0) {
      return `Mövcud saytınızda bir neçə şey diqqətimizi çəkdi: ${i.websiteIssues.slice(0, 2).join(", ").toLowerCase()}.`;
    }
    return "";
  }

  if (i.noWebsite) {
    return `We couldn't find a website for ${i.name} — when customers search for you online, that's a missed opportunity.`;
  }
  if (i.websiteIssues.length > 0) {
    return `A couple of things stood out on your current site: ${i.websiteIssues.slice(0, 2).join(", ").toLowerCase()}.`;
  }
  return "";
}

/**
 * Optional AI rewrite.
 *
 * Constrained to rephrasing the facts already in the draft — it is explicitly
 * told not to add claims. Returns the original on any failure, so a missing key
 * or a provider outage degrades to the template rather than blocking a send.
 */
export async function rewriteWithAi(
  variant: OutreachVariant,
): Promise<OutreachVariant> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return variant;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 700,
      system:
        "You rewrite short B2B outreach emails to sound natural and human. " +
        "Rules: keep every factual claim exactly as given, invent nothing, " +
        "add no statistics or promises, keep it under 140 words, keep any URL " +
        "and the opt-out line verbatim, and keep the same language as the input. " +
        "Return only the rewritten email body.",
      messages: [{ role: "user", content: variant.body }],
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    if (!text || text.length < 40) return variant;
    return { ...variant, body: text };
  } catch {
    // Copy quality is not worth failing a send over.
    return variant;
  }
}
